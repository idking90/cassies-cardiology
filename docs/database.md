# Database Design

## Prototype

The prototype will use local mock data.

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