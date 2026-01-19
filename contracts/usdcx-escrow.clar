;; TrustVault - USDCx Escrow Service for Freelancers
;; Enables secure payments between clients and freelancers with dispute resolution
;; Using Clarity language best practices and proper keywords

;; Contract owner for arbitration
(define-data-var contract-owner principal tx-sender)

;; Error codes
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_NOT_FOUND (err u404))
(define-constant ERR_INVALID_AMOUNT (err u400))
(define-constant ERR_INVALID_STATUS (err u409))
(define-constant ERR_DISPUTE_IN_PROGRESS (err u410))
(define-constant ERR_DEADLINE_PASSED (err u411))
(define-constant ERR_SELF_ESCROW (err u413))
(define-constant ERR_INVALID_RESOLUTION (err u414))

;; Escrow Status
(define-constant STATUS_ACTIVE u1)
(define-constant STATUS_COMPLETED u2)
(define-constant STATUS_REFUNDED u3)
(define-constant STATUS_DISPUTED u4)
(define-constant STATUS_RESOLVED u5)

;; Resolution types
(define-constant RESOLUTION_REFUND_CLIENT u0)
(define-constant RESOLUTION_RELEASE_FREELANCER u1)
(define-constant RESOLUTION_SPLIT u2)

;; Data structures - Escrow records
(define-map escrows
  { escrow-id: uint }
  {
    client: principal,
    freelancer: principal,
    amount: uint,
    status: uint,
    created-at: uint,
    deadline: uint,
    dispute-reason: (optional (string-utf8 500)),
    arbitrator-decision: (optional uint),
    metadata: (optional (string-utf8 200))
  }
)

;; Counter for escrow IDs
(define-data-var next-escrow-id uint u0)

;; ============== Read-only functions ==============

;; Get escrow details by ID
(define-read-only (get-escrow (escrow-id uint))
  (map-get? escrows { escrow-id: escrow-id })
)

;; Get total number of escrows created
(define-read-only (get-total-escrows)
  (var-get next-escrow-id)
)

;; Check if escrow exists and get its status
(define-read-only (get-escrow-status (escrow-id uint))
  (match (map-get? escrows { escrow-id: escrow-id })
    escrow (ok (get status escrow))
    (err u404)
  )
)

;; Get current contract owner
(define-read-only (get-contract-owner)
  (var-get contract-owner)
)

;; Get current Stacks block height (using burn-block-height for consistency)
(define-read-only (get-current-block-height)
  (ok burn-block-height)
)

;; ============== Public functions ==============

;; Create an escrow
;; Parameters:
;;   - freelancer: principal address of the freelancer
;;   - amount: amount in microUSDCx (smallest unit)
;;   - deadline: block height deadline for the project
;;   - metadata: optional project details (title, description, etc.)
(define-public (create-escrow
  (freelancer principal)
  (amount uint)
  (deadline uint)
  (metadata (optional (string-utf8 200)))
)
  (let ((escrow-id (var-get next-escrow-id)))
    ;; Validate inputs
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> deadline burn-block-height) ERR_DEADLINE_PASSED)
    (asserts! (not (is-eq freelancer tx-sender)) ERR_SELF_ESCROW)

    ;; Store escrow details
    (map-insert escrows
      { escrow-id: escrow-id }
      {
        client: tx-sender,
        freelancer: freelancer,
        amount: amount,
        status: STATUS_ACTIVE,
        created-at: burn-block-height,
        deadline: deadline,
        dispute-reason: none,
        arbitrator-decision: none,
        metadata: metadata
      }
    )

    ;; Increment counter
    (var-set next-escrow-id (+ escrow-id u1))
    (ok escrow-id)
  )
)

;; Freelancer marks work as complete
;; Only the freelancer can call this
(define-public (complete-work (escrow-id uint))
  (let ((escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR_NOT_FOUND)))
    ;; Only freelancer can mark complete
    (asserts! (is-eq tx-sender (get freelancer escrow)) ERR_UNAUTHORIZED)
    ;; Must be active status
    (asserts! (is-eq (get status escrow) STATUS_ACTIVE) ERR_INVALID_STATUS)
    ;; Deadline must not have passed
    (asserts! (< burn-block-height (get deadline escrow)) ERR_DEADLINE_PASSED)

    (ok true)
  )
)

;; Client approves and releases funds to freelancer
;; Frontend will handle the actual USDCx transfer
(define-public (approve-release (escrow-id uint))
  (let ((escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR_NOT_FOUND)))
    ;; Only client can approve release
    (asserts! (is-eq tx-sender (get client escrow)) ERR_UNAUTHORIZED)
    ;; Must be active status
    (asserts! (is-eq (get status escrow) STATUS_ACTIVE) ERR_INVALID_STATUS)

    ;; Update escrow status to completed
    (map-set escrows
      { escrow-id: escrow-id }
      (merge escrow { status: STATUS_COMPLETED })
    )

    (ok true)
  )
)

;; Client initiates refund before deadline
;; Frontend will handle the actual USDCx transfer back
(define-public (initiate-refund (escrow-id uint))
  (let ((escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR_NOT_FOUND)))
    ;; Only client can request refund
    (asserts! (is-eq tx-sender (get client escrow)) ERR_UNAUTHORIZED)
    ;; Must be active status
    (asserts! (is-eq (get status escrow) STATUS_ACTIVE) ERR_INVALID_STATUS)
    ;; Cannot refund after deadline
    (asserts! (< burn-block-height (get deadline escrow)) ERR_DEADLINE_PASSED)

    ;; Update escrow status
    (map-set escrows
      { escrow-id: escrow-id }
      (merge escrow { status: STATUS_REFUNDED })
    )

    (ok true)
  )
)

;; Client initiates dispute
;; Parameters:
;;   - escrow-id: the escrow to dispute
;;   - reason: detailed reason for the dispute
(define-public (initiate-dispute (escrow-id uint) (reason (string-utf8 500)))
  (let ((escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR_NOT_FOUND)))
    ;; Only client can initiate dispute
    (asserts! (is-eq tx-sender (get client escrow)) ERR_UNAUTHORIZED)
    ;; Must be active status
    (asserts! (is-eq (get status escrow) STATUS_ACTIVE) ERR_INVALID_STATUS)

    ;; Update escrow status to disputed
    (map-set escrows
      { escrow-id: escrow-id }
      (merge escrow {
        status: STATUS_DISPUTED,
        dispute-reason: (some reason)
      })
    )

    (ok true)
  )
)

;; Arbitrator (contract owner) resolves dispute
;; Parameters:
;;   - escrow-id: the disputed escrow
;;   - resolution: 0=refund client, 1=release to freelancer, 2=split 50/50
;; Frontend will execute actual USDCx distribution after this succeeds
(define-public (resolve-dispute (escrow-id uint) (resolution uint))
  (let ((escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR_NOT_FOUND)))
    ;; Only contract owner can resolve
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    ;; Must be disputed status
    (asserts! (is-eq (get status escrow) STATUS_DISPUTED) ERR_INVALID_STATUS)
    ;; Valid resolution
    (asserts! (< resolution u3) ERR_INVALID_RESOLUTION)

    ;; Update escrow status with arbitrator decision
    (map-set escrows
      { escrow-id: escrow-id }
      (merge escrow {
        status: STATUS_RESOLVED,
        arbitrator-decision: (some resolution)
      })
    )

    (ok true)
  )
)

;; Emergency refund for expired escrows
;; Can be called by anyone after deadline passes
(define-public (claim-expired-refund (escrow-id uint))
  (let ((escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR_NOT_FOUND)))
    ;; Must be active status
    (asserts! (is-eq (get status escrow) STATUS_ACTIVE) ERR_INVALID_STATUS)
    ;; Must be past deadline
    (asserts! (>= burn-block-height (get deadline escrow)) ERR_DEADLINE_PASSED)

    ;; Update escrow status
    (map-set escrows
      { escrow-id: escrow-id }
      (merge escrow { status: STATUS_REFUNDED })
    )

    (ok true)
  )
)

;; Update contract owner (for arbitration delegation)
;; Only current owner can change owner
(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (var-set contract-owner new-owner)
    (ok true)
  )
)