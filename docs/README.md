# Rollout OS — Documentation

The single source of written truth for Rollout OS. Product thinking, design records, and operational runbooks all live here. Start with whichever column matches why you're here.

> New to the project? Read [`HANDOFF.md`](../HANDOFF.md) first (one-file orientation), then [`../README.md`](../README.md).

## Product thinking — _why the product exists_

| #   | Doc                                                                          | Read it for                                                |
| --- | ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 01  | [Manifesto](./01_manifesto.md)                                               | The one-paragraph conviction behind the product            |
| 02  | [Product Thesis](./02_product_thesis.md)                                     | The problem, the market gap, and the bet                   |
| 03  | [Product Vision](./03_product_vision.md)                                     | Where this goes beyond the MVP                             |
| 04  | [Architecture Specification](./04_architecture_specification.md)             | The product architecture: domain model, operational models |
| 05  | [Information Architecture](./05_information_architecture.md)                 | The seven destinations and how they relate                 |
| 06  | [PRD — MVP](./06_prd_mvp.md)                                                 | Personas, journeys, scope, release slices                  |
| 07  | [Product Experience Specification](./07_product_experience_specification.md) | UX principles, empty states, status semantics              |

## Design records — _how it's built_

| #   | Doc                                                | Read it for                                                |
| --- | -------------------------------------------------- | ---------------------------------------------------------- |
| 08  | [Design System](./08_design_system.md)             | Tokens, spacing, type, component + state conventions       |
| 09  | [Database Design](./09_database_design.md)         | Schema, RLS, soft delete, denormalization conventions      |
| 10  | [API Specification](./10_api_specification.md)     | Living server-action spec + conventions (grows per module) |
| 14  | [Auth & Authorization](./14_auth_authorization.md) | Roles, permission matrix, experience profiles vs RBAC      |

## Process & direction

| #   | Doc                                                        | Read it for                                                         |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------- |
| 11  | [Claude Build Guidelines](./11_claude_build_guidelines.md) | How AI-assisted work is scoped and reviewed here                    |
| 12  | [Product Roadmap](./12_product_roadmap.md)                 | What's done, next, later, and explicitly deferred                   |
| 13  | [Decision Log](./13_decision_log.md)                       | The consequential product choices (mirrored in-app at `/decisions`) |

## Runbooks (repo root)

| Doc                                   | Read it for                                                         |
| ------------------------------------- | ------------------------------------------------------------------- |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Code architecture: stack, folder layout, conventions, quality gates |
| [SETUP.md](../SETUP.md)               | Standing up Supabase and deploying to Vercel                        |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Branch/PR workflow, commit conventions, quality gates               |
| [HANDOFF.md](../HANDOFF.md)           | One-file orientation for a fresh session or new machine             |

---

**Conventions for this folder**

- Numbered `NN_snake_case.md`; the number is a reading order, not a strict dependency.
- Product docs (01–07) describe intent; design records (08–10, 14) describe what was built and should track the code.
- When a design record and the code disagree, the code is right — fix the doc in the same PR.
