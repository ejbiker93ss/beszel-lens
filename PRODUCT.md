# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: Preact, Vite, and TypeScript. The user asked for the smallest practical framework with fast builds and easy AI-assisted development.

## Users

People running a Beszel hub who want a faster, denser overview of their systems without maintaining a customized Beszel fork. The initial user is the repository owner and their team.

## Product Purpose

Beszel Lens is a lightweight companion dashboard for Beszel. It signs into an existing hub as a normal user, reads the systems and historical metrics that user may access, and presents fleet health at a glance. Success means the primary screen answers which systems need attention within seconds.

## Positioning

It is an intentionally narrow, read-only Beszel client: stock Beszel remains responsible for collection, alerts, accounts, and administration while Lens owns only the monitoring overview.

## Operating Context

The app is deployed as static files and connects from the browser to a user-supplied Beszel Hub URL. Operators may keep Beszel open separately for administration.

## Capabilities and Constraints

- Public open-source GitHub repository named `beszel-lens`.
- Normal Beszel user authentication; no embedded administrator credentials.
- Read-only system overview and historical CPU, memory, and disk charts.
- Responsive desktop and mobile operation.
- No application backend, database, server-side rendering, or image assets.
- Beszel's pre-1.0 API may change, so API-specific field mapping stays isolated.

## Brand Commitments

The working name is Beszel Lens. It should be visibly related to monitoring, but it is not an official Beszel product and must not imply otherwise.

## Evidence on Hand

Beszel's public REST API documentation and repository TypeScript models describe the available PocketBase collections and compact metric fields. No testimonials, performance claims, or proprietary brand assets are available and none should be fabricated.

## Product Principles

- Keep the browser payload and deployment surface small.
- Make abnormal state more legible than decorative chrome.
- Preserve stock Beszel as the system of record and administration surface.
- Treat API compatibility as an explicit boundary.
- Keep common changes simple enough for humans or AI agents to make quickly.

