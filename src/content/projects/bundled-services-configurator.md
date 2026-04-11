---
title: Bundled services configurator
description: Designing a mobile-first configurator that helps users build and understand bundled telecom offers.
role: Product design
featured: true
order: 1
---
### TL;DR

A mobile-first configurator that helps users build bundled offers step by step.

→ Designed with real pricing logic and business constraints.  
→ Validated in user research (12 IDI).  
→ One of the best-converting lead flows on the platform.

## Context

Although the company offers multiple services that become cheaper when combined, <span class="prose-marker">there was no clear way for users to understand what a personalized offer actually looks like</span>. Instead, users were presented with static pricing tables for individual services (voice, internet, TV), which made it difficult to grasp the value of bundling.

Together with my team lead, I proposed a new way of presenting the offer – as a configurator that lets users build their own bundle step by step. I was responsible for research, interaction design, and prototyping.

With over 90% of users on mobile, I took a mobile-first approach.

## Approach

We started by <span class="prose-marker">mapping all possible service combinations and pricing dependencies</span> in FigJam. This helped us understand the complexity of the system and identify meaningful user flows.

I explored several design directions and, after internal workshops, prepared a prototype for testing.

Based on internal data, we defined a target group and scheduled user research with an external agency. We conducted 12 in-depth interviews (IDI). The research brought valuable insights, especially around <span class="prose-marker">how users understand pricing, order of decisions, and the feeling of control</span>.

Based on the findings, we refined the flow and interactions before implementation.

Despite tight deadlines, we worked closely with an engineering team to deliver a functional version for the new offer launch.

## Challenges

<div class="prose-challenge-pair">
  <p>One key constraint emerged late in the process: the order of adding services had to be fixed due to business logic.</p>
  <p>→ To address this, we introduced a “step 0”, where users select which services they are interested in. The system then guides them through a predefined order, while still <span class="prose-marker">giving a sense of control</span>.</p>
</div>

<div class="prose-challenge-pair">
  <p>Due to technical limitations, users could not complete the purchase directly in the configurator.</p>
  <p>→ Instead, the flow ends with a lead form, where selected services are passed to a consultant. This required us to carefully design expectations and make the transition feel <span class="prose-marker">intentional rather than broken</span>.</p>
</div>

<div class="prose-challenge-pair">
  <p>Another challenge was legal approval. The offer had to present detailed pricing and cost information in a way that satisfied legal requirements, sometimes at the expense of clarity.</p>
  <p>→ We worked through multiple rounds of discussions and copy revisions to find a balance between compliance and readability. This became one of the key design tasks in the project: <span class="prose-marker">making dense information feel clear</span> enough for users, while still meeting legal expectations.</p>
</div>

## Outcomes

The configurator became one of the best-performing lead-generation tools on the platform.

It improved clarity of the offer, helped users understand bundle value, and reduced reliance on static pricing tables.

(Final metrics to be added.)
