# Database Design

## Prototype

The prototype uses local mock topic data and hardcoded aggregate response counts. Topic completion is held in client-side React state for the current browser session and is cleared with Reset Rotation. No learner answer, identity, or completion data is stored.

## Future Data Model

## Topic

Fields:
- id
- name
- description
- completed status
- question reference
- teaching material reference

## Question

Fields:
- id
- topic id
- question text
- answer choices
- correct answer

## Response

Fields:
- id
- question id
- selected answer
- timestamp

Responses are anonymous.

## Teaching Material

Fields:
- id
- topic id
- title
- text content
- images
- references
