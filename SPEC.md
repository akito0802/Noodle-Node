# Noodle Node — Product Specification v1

## Product idea

A mobile-first visual thinking web app for freely organizing thoughts, turning ideas into concrete form, comparing alternatives, and making decisions.

## Core creation modes
- Mind map
- Free placement
- Hierarchical/list view
- Flowchart
- Switch modes during editing

## Node model
- Title
- Detailed memo
- Color
- Tags
- Three-level importance
- Task conversion
- Due date and priority for task nodes
- No node duplication
- No multi-select
- No nested node sub-items

## Organization
- Auto layout
- Groups and collapse
- Search/filter
- Important-points view
- Conclusion node + conclusion summary area
- Undo/redo
- Templates
- Guided thinking flows

## Decision mode
- Unlimited-ish alternatives
- Custom criteria
- 1–5 scoring
- Criterion weights
- Result score + graph + breakdown
- Explicit "decide on this" action
- Decided state visually emphasized

## Tasks
- Map-scoped task list
- Global task list
- Manual / due-date / priority sorting
- No notifications

## Storage
Target architecture:
- Google login only
- Cloud storage
- Autosave
- Version restore
- Trash recovery
- Manual and automatic backups
- Restore all / folder / map

The current repository prototype uses localStorage; cloud infrastructure is the next backend phase.

## Sharing
Target architecture:
- Per-person viewer / commenter / editor roles
- Live collaborator cursors and edited-node presence
- Login-required or link access
- Link view/edit permissions
- Expiry
- Passcode
- Manual revocation
- Optional profile identity visibility

## Export
- Image
- PDF
- Text / outline
- Final summary screen: conclusion, important points, tasks

## Visual system
Brand world:
- Night Chinatown
- Starry sky
- Moderate Chinese neon
- Fantasy atmosphere

Palette:
- Deep navy base
- Neon red important actions
- Warm gold final decisions
- Moon white text

UI:
- Translucent glass cards
- Rounded rectangle nodes
- Neon-sign-inspired icons
- Minimal animation
- Home shows stronger Chinatown ambience
- Editor reduces Chinatown detail and emphasizes the star field
