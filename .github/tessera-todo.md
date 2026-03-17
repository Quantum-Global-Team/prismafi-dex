# TODO — Tessera DEX

Institutional-grade tokenized Forex DEX built for the Polkadot EVM hackathon track.

Repository: `tessera-dex`

---

## 0. Agent execution protocol

These rules are mandatory for the coding agent working in this repository.

### 0.1 Source of truth
- This file is the single source of truth for task execution order.
- The agent must always work from this file.
- The agent must not invent unrelated tasks unless they are strictly required to complete an existing item.
- If a new required task is discovered, the agent must add it to the appropriate section before implementing it.

### 0.2 Task completion behavior
After finishing each task or meaningful subtask, the agent must:

1. Mark the task as completed in this file by changing `- [ ]` to `- [x]`.
2. Add a short execution note under the task if useful, including files touched and important implementation decisions.
3. Run the relevant checks before considering the task done:
   - lint
   - type-check
   - test, if applicable
   - build, if the task affects production code
4. Create a git commit with a clear, professional commit message.
5. Push the branch to the remote repository immediately after the commit.

### 0.3 Git rules
- The agent must commit after every completed task or coherent subtask.
- The agent must push after every commit.
- Commit messages must be professional and descriptive.
- Preferred commit format:
  - `feat: add swap widget shell`
  - `feat: integrate wallet connection`
  - `refactor: extract market table hooks`
  - `fix: handle unsupported network state`
  - `docs: update architecture and setup notes`
- The agent must never accumulate many unrelated changes into one commit.
- The agent must never mark a task as done if the code is not committed and pushed.

### 0.4 If push is not possible
If the environment does not allow pushing to GitHub:
- The agent must still complete the code task.
- The agent must still mark the task done only after preparing the exact git commands.
- The agent must output the exact commands required:
  - `git add .`
  - `git commit -m "<message>"`
  - `git push origin <branch>`
- The agent must clearly state that the push is pending manual execution.

### 0.5 Quality gate
The agent must not mark any item complete if:
- lint fails;
- type-check fails;
- the build is broken;
- major console/runtime errors remain;
- the implementation does not match the architecture rules in `copilot-instructions.md`.

### 0.6 Architecture discipline
- UI components must stay separate from Web3/business logic.
- Blockchain interactions must live in dedicated hooks/adapters.
- No raw mock values should leak into production integration files.
- No `any`.
- No copy-paste duplication across features.
- No giant unstructured components.

---

## 1. Product definition

### 1.1 Vision
Build **Tessera** — a tokenized Forex DEX on Polkadot EVM where users can trade synthetic fiat assets such as `tEUR`, `tJPY`, and `tGBP` against stablecoins through a professional institutional-grade interface.

### 1.2 Core MVP
The MVP is complete when:
- [ ] user can connect wallet
- [ ] user can view supported FX pairs
- [ ] user can enter an amount and get a quote
- [ ] user can execute a basic swap flow
- [ ] user can see balances before and after swap
- [ ] user can see transaction state and feedback
- [ ] app is consistently styled in the Tessera Rose Liquid Glass design system
- [ ] repository is documented and demo-ready

### 1.3 Product principles
- [ ] prioritize a polished demo over protocol overreach
- [ ] keep architecture production-minded even for MVP
- [ ] keep UX simple, calm, and institutional
- [ ] separate UI, domain logic, and Web3 integration
- [ ] prefer real wallet flow with mock market data over fake full-stack complexity
- [ ] keep backend optional and minimal

### 1.4 Out of scope for MVP
- [ ] full order book matching engine
- [ ] production oracle network implementation
- [ ] real-world legal fiat redemption rails
- [ ] advanced cross-chain bridge
- [ ] mobile app
- [ ] admin backoffice
- [ ] high-frequency trading system

---

## 2. Repository setup

### 2.1 GitHub foundation
- [ ] create and configure repository `tessera-dex`
- [ ] add repository description
- [ ] add license
- [ ] add `.gitignore`
- [ ] add `.editorconfig`
- [ ] add `.env.example`
- [ ] add issue templates
- [ ] add pull request template
- [ ] add branch strategy documentation

### 2.2 Project documentation
- [ ] create `README.md`
- [ ] create `TODO.md`
- [ ] create `ARCHITECTURE.md`
- [ ] create `CONTRACTS.md`
- [ ] create `DEPLOYMENT.md`
- [ ] create `PITCH-NOTES.md`

### 2.3 Definition of repository quality
- [ ] no placeholder docs
- [ ] no broken links
- [ ] no dead scripts
- [ ] no unexplained folders
- [ ] setup steps reproducible from a clean machine

---

## 3. Technical architecture

### 3.1 Stack lock
- [x] Next.js App Router
- [x] React
- [x] TypeScript strict mode
- [x] Tailwind CSS
- [x] shadcn/ui
- [x] framer-motion
- [x] wagmi v2
- [x] viem
- [x] RainbowKit
- [x] lightweight-charts
- [x] Lucide icons

### 3.2 Architecture rules
- [ ] use modular feature-based structure
- [ ] keep Web3 logic out of presentational components
- [ ] centralize chain config and contract config
- [ ] centralize token metadata
- [ ] centralize formatting utilities
- [ ] use semantic design tokens instead of raw hex codes
- [ ] use reusable typed adapters for all contract interactions

### 3.3 Target directory structure
- [x] establish the following structure:

```txt
src/
  app/
  components/
    ui/
    layout/
    shared/
  features/
    swap/
    markets/
    portfolio/
    charts/
  web3/
    abis/
    config/
    hooks/
    adapters/
    constants/
  lib/
  hooks/
  styles/
  types/
  data/
```

### 3.4 Code conventions
- [ ] strict TypeScript, no `any`
- [ ] interfaces for object contracts
- [ ] types for unions and utility types
- [ ] early returns
- [ ] small focused components
- [ ] one responsibility per file where practical
- [ ] async flows must expose loading, success, and error states
- [ ] no JS floating-point math for token values
- [ ] use `parseUnits` and `formatUnits` for token math
- [ ] descriptive naming throughout

---

## 4. Bootstrapping the app

### 4.1 Initial scaffolding
- [x] initialize Next.js application
- [x] enable TypeScript strict mode
- [x] setup Tailwind CSS
- [x] setup ESLint
- [x] setup Prettier
- [ ] setup import ordering rules
- [x] setup path aliases
- [ ] setup Husky or equivalent pre-commit hooks if time allows

### 4.2 shadcn/ui foundation
- [x] initialize shadcn/ui
- [x] install core components
- [x] map theme tokens to Rose Liquid Glass palette
- [x] validate dark mode styles across components

### 4.3 Base scripts
- [x] define `dev`
- [x] define `build`
- [x] define `lint`
- [x] define `typecheck`
- [ ] define `test`
- [x] define `format`

---

## 5. Rose Liquid Glass design system

### 5.1 Brand identity
- [x] lock product name as `Tessera`
- [ ] define one-line tagline
- [ ] define concise product subtitle
- [ ] define brand tone: premium, glossy, modern, feminine but sharp
- [x] apply premium pink liquid glass aesthetics

### 5.2 Color tokens
- [x] implement semantic tokens
- [x] set `bg.primary = #0F0A14`
- [x] set `bg.secondary = #16101D`
- [x] set `bg.panel = rgba(34, 22, 44, 0.72)`
- [x] set `bg.elevated = rgba(46, 29, 58, 0.82)`
- [x] set `border.subtle = rgba(255, 255, 255, 0.10)`
- [x] set `border.strong = rgba(255, 182, 221, 0.22)`
- [x] set `brand.primary = #FF4FA3`
- [x] set `brand.secondary = #FF8CC8`
- [x] set `brand.tertiary = #D946EF`
- [x] set `glow.primary = rgba(255, 79, 163, 0.35)`
- [x] set `glow.secondary = rgba(217, 70, 239, 0.25)`
- [x] set `state.positive = #2EE6A6`
- [x] set `state.negative = #FF5C7A`
- [x] set `text.primary = #FFF4FB`
- [x] set `text.secondary = #D8C7D9`
- [x] set `text.muted = #A892AD`

### 5.3 Typography and spacing
- [ ] define typography scale
- [ ] define spacing scale
- [ ] define border radius scale
- [ ] define focus ring styles (soft pink glow)
- [ ] define card shadow and blur policy
- [ ] define table density rules
- [ ] define mobile spacing adjustments

### 5.4 Reusable UI primitives
- [ ] button variants
- [ ] input variants
- [ ] card variants
- [ ] badge variants
- [ ] tabs
- [ ] table shell
- [ ] modal/dialog
- [ ] tooltip
- [ ] dropdown/select
- [ ] toast system
- [ ] skeleton loaders
- [ ] empty state
- [ ] error state

---

## 6. Layout and navigation

### 6.1 App shell
- [x] create root layout
- [x] apply global theme
- [x] add background and typography styles
- [x] create dashboard grid
- [x] define content width constraints

### 6.2 Top navigation
- [x] Tessera logo area
- [x] network status
- [x] wallet connect area
- [ ] market overview quick stats
- [ ] responsive collapse behavior

### 6.3 Navigation model
- [x] define main sections
- [x] add navigation for Swap
- [x] add navigation for Markets
- [x] add navigation for Portfolio
- [x] add navigation for History
- [ ] add mobile-friendly navigation state

---

## 7. Web3 configuration

### 7.1 Chain configuration
- [x] configure target Polkadot EVM-compatible network
- [x] define chain metadata
- [x] define RPC configuration
- [x] define block explorer links
- [ ] define unsupported network state

### 7.2 Wallet setup
- [x] integrate RainbowKit
- [x] configure wallet connectors
- [x] connect wallet flow
- [x] disconnect flow
- [x] wallet reconnect on refresh
- [ ] unsupported network warning
- [ ] empty wallet state

### 7.3 Web3 adapter layer
- [x] create `src/web3/config`
- [x] create `src/web3/abis`
- [x] create `src/web3/constants`
- [x] create `src/web3/hooks`
- [ ] create typed contract config objects
- [ ] isolate all contract reads/writes behind custom hooks

### 7.4 Core custom hooks
- [ ] `useWallet`
- [ ] `useSupportedNetwork`
- [ ] `useTokenBalance`
- [ ] `useSupportedPairs`
- [ ] `useSwapQuote`
- [ ] `useSwapTransaction`
- [ ] `useApproveToken`
- [ ] `useTransactionStatus`

---

## 8. Data strategy

### 8.1 Mock-first delivery
- [ ] stage 1: pure mock data UI
- [ ] stage 2: real wallet + mock market data
- [ ] stage 3: real contract integration
- [ ] stage 4: demo-ready testnet flow

### 8.2 Mock datasets
- [x] token metadata
- [x] supported pairs
- [ ] balances
- [ ] market overview data
- [ ] OHLC chart data
- [ ] transaction history
- [ ] portfolio notional values

### 8.3 Off-chain data policy
- [x] keep chart/history data replaceable
- [x] use adapters for any external data source
- [x] avoid coupling UI directly to raw API responses
- [x] support graceful failure if external data is unavailable

---

## 9. Markets feature

### 9.1 Market model
- [x] define typed market pair model
- [x] define price format rules
- [x] define 24h change model
- [ ] define liquidity/TVL model

### 9.2 Markets table
- [x] create market table component
- [x] create row component
- [x] add pair badge
- [x] add price column
- [x] add 24h change column
- [ ] add volume or TVL column
- [x] add loading state
- [ ] add empty state
- [x] add hover and active row styling
- [ ] add responsive behavior

### 9.3 Market interactions
- [ ] clicking pair updates swap widget
- [ ] clicking pair updates chart
- [ ] active pair state synchronized across page

---

## 10. Swap feature

### 10.1 Swap domain model
- [ ] define swap form state
- [ ] define selected input token
- [ ] define selected output token
- [ ] define amount state
- [ ] define quote state
- [ ] define fee state
- [ ] define approval state
- [ ] define execution state

### 10.2 Swap UI
- [ ] create swap card
- [ ] create amount input
- [ ] create token selector
- [ ] create pair switch action
- [ ] create quote preview row
- [ ] create fee preview row
- [ ] create slippage row
- [ ] create CTA area
- [ ] create pending/success/error feedback

### 10.3 Swap validation
- [ ] prevent zero amount
- [ ] prevent same token pair
- [ ] handle insufficient balance
- [ ] handle missing wallet
- [ ] handle unsupported network
- [ ] handle stale quote
- [ ] handle approval requirement

### 10.4 Swap integration
- [ ] implement quote fetching
- [ ] implement approval flow
- [ ] implement swap write flow
- [ ] implement transaction receipt handling
- [ ] update balances after confirmation
- [ ] show explorer link after transaction

---

## 11. Charts feature

### 11.1 Chart wrapper
- [ ] integrate `lightweight-charts`
- [ ] create reusable chart component
- [ ] isolate chart setup from page code
- [ ] support dynamic pair changes
- [ ] support dynamic timeframe changes

### 11.2 Chart theming
- [ ] apply Rose-black background
- [ ] apply semantic candle colors
- [ ] tone down grid opacity
- [ ] style axes with muted text color
- [ ] remove visual clutter

### 11.3 Chart UX
- [ ] loading skeleton
- [ ] no-data state
- [ ] pair switch behavior
- [ ] resize handling
- [ ] safe unmount cleanup

---

## 12. Portfolio feature

### 12.1 Portfolio model
- [ ] define balance card model
- [ ] define notional value model
- [ ] define holdings table model
- [ ] define recent activity model

### 12.2 Portfolio UI
- [ ] balances card
- [ ] notional summary
- [ ] holdings list
- [ ] recent transactions list
- [ ] empty portfolio state
- [ ] disconnected wallet state

### 12.3 Portfolio integration
- [ ] fetch balances from chain
- [ ] map tokens to fiat value display
- [ ] refresh on successful swap
- [ ] handle loading and error states

---

## 13. Smart contracts

### 13.1 Contract scope for MVP
- [ ] mock stablecoin contract
- [ ] mock synthetic fiat token contracts
- [ ] mock oracle or oracle adapter
- [ ] swap/router contract
- [ ] optional treasury/liquidity contract if needed

### 13.2 Contract design tasks
- [ ] define token decimals
- [ ] define supported assets
- [ ] define pricing model
- [ ] define fee model
- [ ] define ownership/admin controls
- [ ] define pause mechanism
- [ ] define events for all important actions

### 13.3 Contract implementation tasks
- [ ] write interfaces
- [ ] implement mock tokens
- [ ] implement mock oracle
- [ ] implement quote function
- [ ] implement swap function
- [ ] implement validations
- [ ] implement admin config setters
- [ ] emit clear events
- [ ] write unit tests
- [ ] write deployment scripts

### 13.4 Contract safety checklist
- [ ] access control verified
- [ ] zero address checks
- [ ] zero amount checks
- [ ] decimals normalized
- [ ] stale price handling
- [ ] fee bounds enforced
- [ ] pause path tested
- [ ] events emitted
- [ ] revert reasons understandable

---

## 14. Testing and verification

### 14.1 Frontend checks
- [ ] lint passes
- [ ] type-check passes
- [ ] production build passes
- [ ] no major hydration issues
- [ ] no critical console errors

### 14.2 Frontend testing
- [ ] test key utilities
- [ ] test form validation
- [ ] test token selector behavior
- [ ] test disabled CTA states
- [ ] test wallet-required interactions
- [ ] test network warning flow
- [ ] test chart mounting safety

### 14.3 Contract testing
- [ ] token minting tests
- [ ] oracle update tests
- [ ] quote calculation tests
- [ ] swap success tests
- [ ] swap revert tests
- [ ] admin-only function tests
- [ ] pause logic tests
- [ ] decimals edge-case tests

### 14.4 Manual QA checklist
- [ ] open app cleanly
- [ ] connect wallet
- [ ] switch network
- [ ] select market pair
- [ ] enter amount
- [ ] see quote
- [ ] approve token if needed
- [ ] execute swap
- [ ] receive confirmation
- [ ] see updated balances
- [ ] verify transaction link
- [ ] verify mobile layout

---

## 15. Deployment

### 15.1 Environment
- [ ] finalize `.env.example`
- [ ] document required env vars
- [ ] add contract address config
- [ ] add explorer links
- [ ] verify production-safe defaults

### 15.2 Contract deployment
- [ ] choose target testnet
- [ ] deploy mock tokens
- [ ] deploy oracle/mock oracle
- [ ] deploy swap contract
- [ ] store deployed addresses
- [ ] verify integration from frontend

### 15.3 Frontend deployment
- [ ] deploy web app
- [ ] configure env vars
- [ ] verify wallet connection in deployed app
- [ ] verify swap flow in deployed app
- [ ] verify chart rendering in deployed app
- [ ] verify responsive layout in production

---

## 16. Documentation and presentation

### 16.1 README
- [ ] product overview
- [ ] problem statement
- [ ] why tokenized Forex
- [ ] why Polkadot EVM
- [ ] architecture summary
- [ ] stack summary
- [ ] local setup instructions
- [ ] deployment instructions
- [ ] screenshots
- [ ] demo link
- [ ] team info

### 16.2 Architecture docs
- [ ] frontend architecture overview
- [ ] Web3 integration overview
- [ ] contract architecture overview
- [ ] data flow diagrams
- [ ] folder structure rationale

### 16.3 Judge-facing assets
- [ ] 30-second pitch
- [ ] 2-minute pitch
- [ ] demo script
- [ ] architecture diagram
- [ ] contract diagram
- [ ] polished screenshots
- [ ] submission notes

---

## 17. Demo readiness

### 17.1 Demo flow
- [ ] define best-case demo path
- [ ] define fallback demo path
- [ ] define mock/demo-safe mode
- [ ] prepare sample wallet balances
- [ ] prepare screen recording backup

### 17.2 Q&A preparation
- [ ] why Polkadot EVM
- [ ] why synthetic fiat
- [ ] where prices come from
- [ ] why not a traditional Forex app
- [ ] how swap pricing works
- [ ] how oracle risk is handled
- [ ] how protocol can evolve after hackathon

---

## 18. Final polish

### 18.1 Product polish
- [ ] remove dead buttons
- [ ] remove placeholder text
- [ ] remove debug logs
- [ ] remove unused imports
- [ ] align spacing and typography
- [ ] verify semantic colors
- [ ] verify consistency across cards, tables, and forms

### 18.2 Engineering polish
- [ ] no broken imports
- [ ] no unused files
- [ ] no duplicated token metadata
- [ ] no raw contract addresses scattered in code
- [ ] no hardcoded secrets
- [ ] no inconsistent naming

### 18.3 Submission polish
- [ ] final README proofread
- [ ] final deployment link checked
- [ ] final screenshots attached
- [ ] final demo rehearsed
- [ ] final branch pushed
- [ ] final submission package ready

---

## 19. Suggested execution order

### Phase 1 — foundation
- [x] repo setup
- [x] app scaffold
- [x] lint/type/build pipeline
- [x] architecture folders
- [x] design tokens
- [x] shadcn theme alignment

### Phase 2 — UI shell
- [x] layout
- [x] header
- [x] navigation
- [x] core primitives
- [x] dashboard structure

### Phase 3 — mock product
- [ ] markets table with mock data
- [ ] swap widget with mock data
- [ ] chart with mock candles
- [ ] portfolio with mock balances

### Phase 4 — Web3 integration
- [ ] wallet connect
- [ ] network handling
- [ ] balances
- [ ] quote hook
- [ ] approval flow
- [ ] swap flow

### Phase 5 — contracts
- [ ] mock tokens
- [ ] oracle
- [ ] swap/router
- [ ] tests
- [ ] deploy to testnet
- [ ] wire addresses into frontend

### Phase 6 — launch readiness
- [ ] polish states
- [ ] docs
- [ ] demo assets
- [ ] submission quality pass

---

## 20. Definition of done

Tessera is ready for hackathon submission when:
- [ ] the app is clean, coherent, and institutional in presentation
- [ ] the core swap story works end-to-end
- [ ] the repository looks professional and structured
- [ ] the codebase follows the architecture rules
- [ ] each completed task is marked in this file
- [ ] each completed task has been committed
- [ ] each commit has been pushed to the remote repository
- [ ] the demo can be understood in under 2 minutes

---

## 21. Session log template

Use this section to keep short notes while executing.

### Example entry
- Date:
- Task completed:
- Files changed:
- Checks run:
- Commit:
- Push:
- Notes:

---

## 22. Commit log expectation

For every completed task, add one short note in the relevant section if the change was substantial. Example:

- [x] create swap card
  - Note: implemented `SwapCard.tsx`, extracted `AmountInput.tsx`, added disabled CTA states.
  - Commit: `feat: add swap card UI`
  - Push: completed

This pattern is required throughout execution.