#!/usr/bin/env python3
"""One-time, conservative DOCX-to-curriculum preview importer.

Writes only to import-preview. It intentionally favors review warnings over
guessing when source formatting cannot be mapped confidently.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import zipfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PR = "http://schemas.openxmlformats.org/package/2006/relationships"
NS = {"w": W, "a": A, "r": R}

JUNK_PATTERNS = [
    re.compile(r"^Core Topic(?:\s*-\s*)?$", re.I), re.compile(r"^Report Errata$", re.I),
    re.compile(r".*PREV.*NEXT.*", re.I),
    re.compile(r"^Session Details$", re.I),
]
SECTION_RE = re.compile(r"^(answer and explanation|answer|explanation|testing point|bottom line|key diagnostic clues|why the other answers are wrong)\s*:?[\s]*(.*)$", re.I)
QUESTION_RE = re.compile(r"^Question\s+([^.:]+)[.:]?\s*(.*)$", re.I)
CORRECT_RE = re.compile(r"^(?:Correct\s+Answer\s*:\s*|Answer\s*:\s*)([A-E])\b(?:\s*[.):-]|\s+[—–-])?\s*(.*)$", re.I)
OPTION_TOKEN_RE = re.compile(r"(?<![A-Za-z0-9])([A-E])(?:[.)]|(?=\s+[A-Z]))\s+")
REVIEWED_MEDIA: dict[tuple[str, int], dict[str, str]] = {
    ("asd", 1): {"type": "ecg", "placement": "explanation", "alt": "12-lead ECG tracing with an arrow marking the waveform in lead V1."},
    ("ekg", 1): {"type": "ecg", "placement": "explanation", "alt": "12-lead ECG tracing from a young infant on red grid paper."},
    ("infectious-disease", 1): {"type": "ecg", "placement": "question", "alt": "ECG tracing with standard and right-sided precordial leads, including V3R and V4R."},
    ("cyanotic-heart", 1): {"type": "xray", "placement": "question", "alt": "Chest radiograph of an infant."},
    ("cyanotic-heart", 2): {"type": "diagram", "placement": "explanation", "alt": "Side-by-side heart diagrams labeled Normal and D-transposition of the great arteries."},
    ("tapvr", 1): {"type": "diagram", "placement": "explanation", "alt": "Heart diagram showing pulmonary veins connecting to a vertical vein, with the SVC, atrial septal defect, hepatic vein, and enlarged right ventricle labeled."},
    ("pda", 1): {"type": "diagram", "placement": "explanation", "alt": "Heart diagram showing a connection between the aorta and pulmonary artery with flow arrows."},
}


@dataclass
class Block:
    index: int
    kind: str
    text: str = ""
    style: str = ""
    list_kind: str | None = None
    rows: list[list[str]] | None = None
    image_ids: list[str] = field(default_factory=list)
    list_label: str | None = None


def qname(namespace: str, name: str) -> str:
    return f"{{{namespace}}}{name}"


def element_text(element: ET.Element) -> str:
    pieces: list[str] = []
    for node in element.iter():
        if node.tag == qname(W, "t") and node.text:
            pieces.append(node.text)
        elif node.tag == qname(W, "tab"):
            pieces.append("\t")
        elif node.tag in {qname(W, "br"), qname(W, "cr")}:
            pieces.append("\n")
    return re.sub(r"[ \t]+", " ", "".join(pieces)).strip()


def load_relationships(archive: zipfile.ZipFile) -> dict[str, str]:
    root = ET.fromstring(archive.read("word/_rels/document.xml.rels"))
    return {node.get("Id", ""): node.get("Target", "") for node in root.findall(f"{{{PR}}}Relationship")}


def read_numbering(archive: zipfile.ZipFile) -> dict[tuple[str, str], tuple[str, int]]:
    if "word/numbering.xml" not in archive.namelist():
        return {}
    root = ET.fromstring(archive.read("word/numbering.xml"))
    abstract: dict[str, dict[str, tuple[str, int]]] = {}
    for definition in root.findall("w:abstractNum", NS):
        definition_id = definition.get(qname(W, "abstractNumId"), "")
        levels: dict[str, tuple[str, int]] = {}
        for level in definition.findall("w:lvl", NS):
            level_id = level.get(qname(W, "ilvl"), "0")
            format_node, start_node = level.find("w:numFmt", NS), level.find("w:start", NS)
            levels[level_id] = (
                format_node.get(qname(W, "val"), "decimal") if format_node is not None else "decimal",
                int(start_node.get(qname(W, "val"), "1")) if start_node is not None else 1,
            )
        abstract[definition_id] = levels
    formats: dict[tuple[str, str], tuple[str, int]] = {}
    for numbering in root.findall("w:num", NS):
        num_id = numbering.get(qname(W, "numId"), "")
        abstract_node = numbering.find("w:abstractNumId", NS)
        abstract_id = abstract_node.get(qname(W, "val"), "") if abstract_node is not None else ""
        for level_id, details in abstract.get(abstract_id, {}).items():
            formats[(num_id, level_id)] = details
    return formats


def format_list_label(value: int, number_format: str) -> str | None:
    if number_format in {"upperLetter", "lowerLetter"} and 1 <= value <= 26:
        letter = chr(ord("A") + value - 1)
        return letter if number_format == "upperLetter" else letter.lower()
    if number_format == "decimal": return str(value)
    return None


def read_blocks(archive: zipfile.ZipFile) -> tuple[list[Block], bool]:
    root = ET.fromstring(archive.read("word/document.xml"))
    body = root.find("w:body", NS)
    if body is None:
        raise ValueError("DOCX has no document body")
    blocks: list[Block] = []
    numbering = read_numbering(archive)
    counters: dict[tuple[str, str], int] = {}
    has_rendered_pages = bool(root.findall(".//w:lastRenderedPageBreak", NS))
    for element in body:
        if element.tag == qname(W, "p"):
            style_node = element.find("./w:pPr/w:pStyle", NS)
            style = style_node.get(qname(W, "val"), "") if style_node is not None else ""
            num_node = element.find("./w:pPr/w:numPr/w:numId", NS)
            level_node = element.find("./w:pPr/w:numPr/w:ilvl", NS)
            list_kind = None
            list_label = None
            if num_node is not None:
                num_id = num_node.get(qname(W, "val"), "")
                level_id = level_node.get(qname(W, "val"), "0") if level_node is not None else "0"
                number_format, start = numbering.get((num_id, level_id), ("decimal", 1))
                list_kind = "bullets" if number_format == "bullet" else "numbered"
                key = (num_id, level_id)
                counters[key] = counters.get(key, start - 1) + 1
                list_label = format_list_label(counters[key], number_format)
            image_ids = [node.get(qname(R, "embed"), "") for node in element.findall(".//a:blip", NS)]
            text = element_text(element)
            if text or image_ids or style == "Title":
                blocks.append(Block(len(blocks), "paragraph", text, style, list_kind, image_ids=image_ids, list_label=list_label))
        elif element.tag == qname(W, "tbl"):
            rows = []
            for row in element.findall("./w:tr", NS):
                rows.append([element_text(cell) for cell in row.findall("./w:tc", NS)])
            blocks.append(Block(len(blocks), "table", rows=rows))
    return blocks, has_rendered_pages


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "untitled-topic"


def split_topics(blocks: list[Block]) -> list[tuple[Block, list[Block]]]:
    title_positions = [index for index, block in enumerate(blocks) if block.style == "Title" and block.text]
    topics = []
    for position, start in enumerate(title_positions):
        end = title_positions[position + 1] if position + 1 < len(title_positions) else len(blocks)
        topics.append((blocks[start], blocks[start + 1:end]))
    return topics


def split_options(text: str) -> list[dict[str, str]]:
    normalized = re.sub(r"\s+", " ", text).strip()
    matches = list(OPTION_TOKEN_RE.finditer(normalized))
    if len(matches) < 2:
        return []
    letters = [match.group(1).upper() for match in matches]
    expected = [chr(ord(letters[0]) + offset) for offset in range(len(letters))]
    if letters != expected or letters[0] != "A":
        return []
    return [{"id": match.group(1).upper(), "text": normalized[match.end():matches[index + 1].start() if index + 1 < len(matches) else None].strip(" ;")}
            for index, match in enumerate(matches)]


def find_options(blocks: list[Block]) -> tuple[list[dict[str, str]], set[int]]:
    for block in blocks:
        options = split_options(block.text)
        if options:
            return options, {block.index}
    automatic: list[dict[str, str]] = []
    automatic_blocks: set[int] = set()
    for block in blocks:
        label = (block.list_label or "").upper()
        if label == "A":
            automatic = [{"id": "A", "text": block.text.strip()}]
            automatic_blocks = {block.index}
        elif automatic and label == chr(ord("A") + len(automatic)):
            automatic.append({"id": label, "text": block.text.strip()})
            automatic_blocks.add(block.index)
            if len(automatic) == 5:
                return automatic, automatic_blocks
        elif automatic:
            automatic, automatic_blocks = [], set()
    collected: list[dict[str, str]] = []
    used: set[int] = set()
    for block in blocks:
        match = re.match(r"^([A-E])[.)]?\s*(.+)$", block.text.strip())
        if match:
            letter = match.group(1).upper()
            if letter == "A":
                collected = [{"id": letter, "text": match.group(2).strip()}]
                used = {block.index}
            elif collected and letter == chr(ord("A") + len(collected)):
                collected.append({"id": letter, "text": match.group(2).strip()})
                used.add(block.index)
            else:
                collected, used = [], set()
            if len(collected) == 5:
                return collected, used
        elif collected:
            collected, used = [], set()
    return (collected, used) if len(collected) >= 2 else ([], set())


def extract_answer(blocks: list[Block]) -> tuple[str | None, str | None, int | None]:
    for block in blocks:
        match = CORRECT_RE.match(block.text.strip())
        if match:
            return match.group(1).upper(), match.group(2).strip(" —–-:.") or None, block.index
    for index, block in enumerate(blocks):
        if re.fullmatch(r"Answer(?:\s+and\s+Explanation)?\s*:?​?", block.text.strip(), re.I):
            for following in blocks[index + 1:index + 3]:
                match = re.match(r"^([A-E])\b(?:[.)]|\s+[—–-])?\s*(.*)$", following.text.strip())
                if match:
                    return match.group(1).upper(), match.group(2).strip(" —–-:.") or None, following.index
    return None, None, None


def compare_answer_text(answer_text: str, option_text: str) -> bool:
    normalize = lambda value: re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()
    left, right = normalize(answer_text), normalize(option_text)
    return left == right or (left and right and (left in right or right in left))


def extract_option_rationales(blocks: list[Block]) -> tuple[list[dict[str, Any]], set[int], list[str]]:
    heading_index = next((index for index, block in enumerate(blocks) if re.match(r"^Why the other answers are wrong\s*:?​?$", block.text.strip(), re.I)), None)
    if heading_index is None:
        return [], set(), []
    rationales: list[dict[str, Any]] = []
    used = {blocks[heading_index].index}
    warnings: list[str] = []
    current: dict[str, Any] | None = None
    for block in blocks[heading_index + 1:]:
        if SECTION_RE.match(block.text.strip()):
            break
        match = re.match(r"^([A-E])\s*(?:[.):]\s*|(?=\())(.+)$", block.text.strip())
        if match:
            current = {"optionId": match.group(1).upper(), "content": [{"type": "paragraph", "text": match.group(2).strip()}]}
            rationales.append(current)
            used.add(block.index)
        elif current and block.kind == "paragraph" and block.text:
            current["content"].append({"type": "paragraph", "text": block.text})
            used.add(block.index)
        elif block.text:
            warnings.append(f"Content after explicit option-rationale heading could not be mapped at source block {block.index}.")
    if not rationales:
        warnings.append("Explicit option-rationale heading was found, but no rationales were parsed.")
    return rationales, used, warnings


def content_blocks(blocks: list[Block], media_by_block: dict[int, list[dict[str, Any]]], skip: set[int]) -> tuple[list[dict[str, Any]], list[str]]:
    output: list[dict[str, Any]] = []
    unmapped: list[str] = []
    pending_list: dict[str, Any] | None = None
    for block in blocks:
        if block.index in skip:
            continue
        if block.kind == "table":
            pending_list = None
            rows = block.rows or []
            width = max((len(row) for row in rows), default=0)
            if len(rows) >= 2 and width and all(len(row) == width for row in rows):
                output.append({"type": "table", "headers": rows[0], "rows": rows[1:]})
            else:
                unmapped.append(f"Malformed table at source block {block.index}.")
            continue
        text = block.text.strip()
        section = SECTION_RE.match(text)
        if section and not section.group(2):
            continue
        if section and section.group(2):
            text = section.group(2).strip()
        if text:
            if block.list_kind:
                if pending_list is None or pending_list["type"] != block.list_kind:
                    pending_list = {"type": block.list_kind, "items": []}
                    output.append(pending_list)
                pending_list["items"].append(text)
            else:
                pending_list = None
                output.append({"type": "paragraph", "text": text})
        for media in media_by_block.get(block.index, []):
            pending_list = None
            output.append({"type": "media", "media": media})
    return output, unmapped


def classify_media_type(previous_text: str, source_text: str) -> str:
    if re.search(r"\b(cxr|chest\s+x[- ]?ray|radiograph)\b.{0,35}\b(shown|below|figure)\b", previous_text, re.I): return "xray"
    if re.search(r"\b(ecg|ekg|electrocardiogram)\b", previous_text, re.I) and re.search(r"\b(shown|below|figure)\b", previous_text, re.I): return "ecg"
    if re.search(r"\b(illustration|diagram|schematic)\b", source_text, re.I): return "diagram"
    return "image"


def extract_media(archive: zipfile.ZipFile, relationships: dict[str, str], title: str, topic_blocks: list[Block], media_root: Path) -> tuple[dict[int, list[dict[str, Any]]], list[dict[str, Any]], list[str], set[int]]:
    mapping: dict[int, list[dict[str, Any]]] = {}
    report: list[dict[str, Any]] = []
    warnings: list[str] = []
    attribution_blocks: set[int] = set()
    slug = slugify(title)
    topic_dir = media_root / slug
    count = 0
    for local_index, block in enumerate(topic_blocks):
        for rel_id in block.image_ids:
            target = relationships.get(rel_id)
            if not target or not target.startswith("media/"):
                warnings.append(f"Unresolved image relationship {rel_id} at source block {block.index}.")
                continue
            count += 1
            previous = next((item.text for item in reversed(topic_blocks[:local_index]) if item.text), "")
            following = next((item for item in topic_blocks[local_index + 1:] if item.text), None)
            source_match = re.match(r"^Source\s*:\s*(.+)$", following.text, re.I) if following else None
            source_text = source_match.group(1).strip() if source_match else ""
            reviewed = REVIEWED_MEDIA.get((slug, count))
            media_type = reviewed["type"] if reviewed else classify_media_type(previous, source_text)
            extension = Path(target).suffix.lower() or ".bin"
            filename = f"{slug}-{media_type}-{count:02d}{extension}"
            topic_dir.mkdir(parents=True, exist_ok=True)
            (topic_dir / filename).write_bytes(archive.read(f"word/{target}"))
            relative = f"/import-preview/media/{slug}/{filename}"
            media = {"type": media_type, "src": relative, "alt": reviewed["alt"] if reviewed else f"Source figure for {title}"}
            if source_text:
                media["source"] = source_text
                attribution_blocks.add(following.index)
            mapping.setdefault(block.index, []).append(media)
            report.append({"sourceBlock": block.index, "file": relative, "type": media_type, "alt": media["alt"], "attribution": source_text or None, "placement": "unresolved"})
            if not reviewed:
                review_fields = "alt text and media-type" if source_text else "alt text, attribution, and media-type"
                warnings.append(f"Figure at source block {block.index} needs human {review_fields} review; placement was inferred from its source block.")
    return mapping, report, warnings, attribution_blocks


def parse_topic(title_block: Block, blocks: list[Block], archive: zipfile.ZipFile, relationships: dict[str, str], media_root: Path) -> tuple[dict[str, Any], dict[str, Any]]:
    title = title_block.text.strip()
    warnings: list[str] = []
    junk: list[dict[str, Any]] = []
    clean_blocks = []
    junk_section = False
    for block in blocks:
        if re.match(r"^Core Topic", block.text.strip(), re.I):
            junk_section = True
        if junk_section or any(pattern.match(block.text.strip()) for pattern in JUNK_PATTERNS):
            junk.append({"sourceBlock": block.index, "text": block.text})
            if re.match(r"^Session Details$", block.text.strip(), re.I):
                junk_section = False
        else:
            clean_blocks.append(block)
    if any(re.search(r"(?:â.|�)", block.text) for block in clean_blocks):
        warnings.append("Source text contains apparent character-encoding artifacts; preserved verbatim for review.")
    media_map, media_report, media_warnings, attribution_blocks = extract_media(archive, relationships, title, clean_blocks, media_root)
    warnings.extend(media_warnings)

    answer_id, answer_text, answer_block_index = extract_answer(clean_blocks)
    answer_position = next((index for index, block in enumerate(clean_blocks) if block.index == answer_block_index), None)
    question_blocks = clean_blocks[:answer_position] if answer_position is not None else clean_blocks
    options, option_blocks = find_options(question_blocks)
    if not options:
        warnings.append("Malformed or missing A–E answer options.")
    elif any(not option["text"] for option in options):
        warnings.append("One or more answer options have no text.")
    if not answer_id:
        warnings.append("Missing or unrecognized answer key.")
    elif answer_id not in {option["id"] for option in options}:
        warnings.append(f"Correct answer {answer_id} does not match a parsed option.")
    elif answer_text:
        option_text = next(option["text"] for option in options if option["id"] == answer_id)
        if not compare_answer_text(answer_text, option_text):
            warnings.append(f"Correct-answer text does not match option {answer_id}: answer text={answer_text!r}, option text={option_text!r}.")

    question_number = None
    question_text_blocks: list[Block] = []
    for block in question_blocks:
        if block.index in option_blocks:
            continue
        match = QUESTION_RE.match(block.text)
        text = block.text
        if match and question_number is None:
            question_number, text = match.group(1).strip(), match.group(2).strip()
        if text or block.image_ids:
            question_text_blocks.append(Block(block.index, block.kind, text, block.style, block.list_kind, block.rows, block.image_ids, block.list_label))
    text_only = [block for block in question_text_blocks if block.text and not SECTION_RE.match(block.text)]
    prompt_block = next((block for block in reversed(text_only) if re.search(r"\?|which of|what is|select|choose", block.text, re.I)), text_only[-1] if text_only else None)
    if not prompt_block:
        warnings.append("Question prompt could not be identified.")
    stem_parts = [block.text for block in text_only if prompt_block is None or block.index != prompt_block.index]
    stem = "\n\n".join(stem_parts).strip()
    prompt = prompt_block.text.strip() if prompt_block else ""
    if not stem:
        warnings.append("Clinical vignette/stem is missing or could not be separated from the prompt.")

    question_media = []
    for block in question_blocks:
        for media in media_map.get(block.index, []):
            question_media.append(media)
            for item in media_report:
                if item["sourceBlock"] == block.index: item["placement"] = "question"

    explanation_start = (answer_position + 1) if answer_position is not None else len(clean_blocks)
    explanation_source = clean_blocks[explanation_start:]
    option_rationales, rationale_blocks, rationale_warnings = extract_option_rationales(explanation_source)
    warnings.extend(rationale_warnings)
    parsed_option_ids = {option["id"] for option in options}
    for rationale in option_rationales:
        if rationale["optionId"] not in parsed_option_ids:
            warnings.append(f"Rationale references unparsed option {rationale['optionId']}.")
    testing_point = None
    bottom_line = None
    explanation_skip: set[int] = set(rationale_blocks) | attribution_blocks
    for block in explanation_source:
        section = SECTION_RE.match(block.text.strip())
        if not section: continue
        name, inline = section.group(1).lower(), section.group(2).strip()
        if name == "testing point":
            testing_point = inline or None
            explanation_skip.add(block.index)
        elif name == "bottom line":
            bottom_line = inline or None
            explanation_skip.add(block.index)
    # If a standalone heading was found, take only the immediately following
    # paragraph; longer ranges remain in explanation rather than being guessed.
    for name, current in (("testing point", testing_point), ("bottom line", bottom_line)):
        if current: continue
        for index, block in enumerate(explanation_source[:-1]):
            section = SECTION_RE.match(block.text.strip())
            if section and section.group(1).lower() == name and not section.group(2):
                following = explanation_source[index + 1]
                if following.kind == "paragraph" and following.text:
                    if name == "testing point": testing_point = following.text
                    else: bottom_line = following.text
                    explanation_skip.update({block.index, following.index})
                break

    explanation, unmapped = content_blocks(explanation_source, media_map, explanation_skip)
    warnings.extend(unmapped)
    for block in explanation_source:
        if block.index in media_map:
            for item in media_report:
                if item["sourceBlock"] == block.index: item["placement"] = "explanation"
    if not explanation:
        warnings.append("No explanation content was confidently mapped.")
    informational_cleanup = [f"Removed {len(junk)} confirmed source-page navigation/junk block(s)."] if junk else []
    for media_index, item in enumerate(media_report, 1):
        reviewed = REVIEWED_MEDIA.get((slugify(title), media_index))
        if reviewed and item["placement"] != reviewed["placement"]:
            warnings.append(f"Reviewed placement for figure {media_index} conflicts with its parsed source position.")
        if reviewed:
            item["placement"] = reviewed["placement"]

    topic: dict[str, Any] = {
        "id": slugify(title), "name": title,
        "question": {**({"sourceQuestionNumber": question_number} if question_number else {}), "stem": stem, **({"media": question_media} if question_media else {}), "prompt": prompt},
        "options": options, "correctOptionId": answer_id or "", "explanation": explanation,
    }
    if option_rationales: topic["optionRationales"] = option_rationales
    if testing_point: topic["testingPoint"] = testing_point
    if bottom_line: topic["bottomLine"] = bottom_line
    confidence = "high" if not warnings else ("medium" if not any(re.search(r"missing|malformed|does not match|could not|unresolved", warning, re.I) for warning in warnings) else "low")
    report = {
        "id": topic["id"], "detectedTitle": title, "sourcePageRange": None,
        "sourceBlockRange": [title_block.index, blocks[-1].index if blocks else title_block.index],
        "parsedQuestionNumber": question_number, "answerCount": len(options), "detectedCorrectAnswer": answer_id,
        "testingPointPresent": bool(testing_point), "bottomLinePresent": bool(bottom_line),
        "media": media_report, "parserConfidence": confidence, "warnings": warnings,
        "informationalCleanup": informational_cleanup,
        "removedJunk": junk,
    }
    return topic, report


def write_markdown(report: dict[str, Any], path: Path) -> None:
    lines = ["# Curriculum migration preview", "", f"- Topics detected: {report['summary']['topicsDetected']}", f"- Parsed cleanly: {report['summary']['parsedCleanly']}", f"- Requiring review: {report['summary']['requiringReview']}", f"- Images extracted: {report['summary']['imagesExtracted']}", "", "> Source page ranges are unavailable because the DOCX does not contain rendered page-break metadata. Source block ranges are included for traceability.", ""]
    for topic in report["topics"]:
        lines.extend([f"## {topic['detectedTitle']}", "", f"- ID: `{topic['id']}`", f"- Source pages: unavailable", f"- Source blocks: {topic['sourceBlockRange'][0]}–{topic['sourceBlockRange'][1]}", f"- Question number: {topic['parsedQuestionNumber'] or 'none detected'}", f"- Answers: {topic['answerCount']}", f"- Correct answer: {topic['detectedCorrectAnswer'] or 'not detected'}", f"- Testing Point: {'yes' if topic['testingPointPresent'] else 'no'}", f"- Bottom Line: {'yes' if topic['bottomLinePresent'] else 'no'}", f"- Media: {len(topic['media'])}", f"- Confidence: **{topic['parserConfidence']}**", ""])
        if topic["media"]:
            lines.append("Media placement:")
            lines.append("")
            lines.extend(f"- `{item['file']}` — {item['placement']}, `{item['type']}`; alt: {item['alt']}; attribution: {item['attribution'] or 'none in adjacent source'}; source block {item['sourceBlock']}" for item in topic["media"])
            lines.append("")
        if topic["warnings"]:
            lines.append("Warnings:")
            lines.append("")
            lines.extend(f"- {warning}" for warning in topic["warnings"])
            lines.append("")
        if topic["informationalCleanup"]:
            lines.append("Informational cleanup:")
            lines.append("")
            lines.extend(f"- {item}" for item in topic["informationalCleanup"])
            lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", nargs="?", default="import-source/Cassie's Cardiology Questions.docx")
    parser.add_argument("--output", default="import-preview")
    args = parser.parse_args()
    source, output = Path(args.source), Path(args.output)
    workspace, resolved_output = Path.cwd().resolve(), output.resolve()
    if resolved_output.parent != workspace or not resolved_output.name.startswith("import-preview"):
        raise ValueError("Output must be a top-level import-preview* directory inside the workspace")
    if output.exists(): shutil.rmtree(output)
    topics_dir, media_dir = output / "topics", output / "media"
    topics_dir.mkdir(parents=True)
    media_dir.mkdir(parents=True)
    with zipfile.ZipFile(source) as archive:
        blocks, has_rendered_pages = read_blocks(archive)
        relationships = load_relationships(archive)
        sections = split_topics(blocks)
        parsed = [parse_topic(title, topic_blocks, archive, relationships, media_dir) for title, topic_blocks in sections]
    reports = [item[1] for item in parsed]
    for topic, _ in parsed:
        (topics_dir / f"{topic['id']}.json").write_text(json.dumps(topic, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    images = sum(len(topic["media"]) for topic in reports)
    clean = sum(not topic["warnings"] for topic in reports)
    report = {
        "source": str(source), "renderedPageMetadataAvailable": has_rendered_pages,
        "summary": {"topicsDetected": len(reports), "parsedCleanly": clean, "requiringReview": len(reports) - clean, "imagesExtracted": images},
        "topics": reports,
    }
    (output / "migration-report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    write_markdown(report, output / "migration-report.md")
    print(json.dumps(report["summary"], indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
