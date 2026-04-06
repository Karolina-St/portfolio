---
title: Store locator redesign & ORCA framework 
description: Redesigning a store locator with accessibility in mind and introducing a structured way to communicate complex UI systems.
role: Product design
featured: true
order: 3
---
### TL;DR

An accessible store locator redesigned with a system-first approach.

→ WCAG-friendly structure  
→ List-first design for better usability  
→ ORCA framework to communicate complex UI logic

## Context

The existing store locator did not meet WCAG requirements and felt visually outdated. At the same time, a new business need emerged: the ability to link directly to specific store locations. This required rethinking not only the interface, but also how store data is structured and presented.

## Approach

I started by reviewing best practices for store locators, including Baymard Institute reports and competitive analysis. Based on this, I redesigned both the map and the results list, shifting the focus toward a more accessible and structured experience.

I made the results list the primary element — designed to work well with screen readers and support different user needs.

Because the project introduced several new patterns, I also needed a clearer way to communicate the system to the team. To address this, I introduced an object-oriented UX framework (ORCA: Objects, Relationships, CTAs, Attributes).

I mapped:
- key objects on the page,
- relationships between them,
- available actions (CTAs),
- important attributes.

This helped present the design in a concise and structured way, making it easier to understand and implement.

## Outcomes

The result was a redesigned store locator with improved accessibility and a clearer structure. The list-based approach made the experience more usable for assistive technologies and more predictable for users.

The ORCA framework proved useful in communicating complex UI logic. After seeing this documentation, a developer invited me to collaborate on a side project, which was a strong signal for me that the approach improved cross-team understanding.