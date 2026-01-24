;; TrustWork Marketplace - FIXED & ENHANCED
;; Job Platform with Bidding, Escrow, Auto-Release & Dispute Resolution
;; Token: USDCx on Stacks Testnet

;; ============ CONSTANTS ============

(define-constant USDCX_TOKEN 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx)
(define-constant PLATFORM_FEE_BPS u200) ;; 2%
(define-constant AUTO_RELEASE_BLOCKS u1000) ;; ~7 days on Stacks

(define-data-var platform-owner principal tx-sender)
(define-data-var total-platform-fees uint u0)

;; ============ ERROR CODES ============

(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_NOT_FOUND (err u404))
(define-constant ERR_INVALID_AMOUNT (err u400))
(define-constant ERR_INVALID_STATUS (err u409))
(define-constant ERR_INSUFFICIENT_BALANCE (err u402))
(define-constant ERR_DEADLINE_PASSED (err u411))
(define-constant ERR_SELF_BID (err u413))
(define-constant ERR_JOB_NOT_ACTIVE (err u420))
(define-constant ERR_NO_BIDS (err u421))
(define-constant ERR_INVALID_BID (err u422))
(define-constant ERR_WORK_NOT_SUBMITTED (err u423))
(define-constant ERR_WORK_ALREADY_SUBMITTED (err u424))
(define-constant ERR_INVALID_FREELANCER (err u425))
(define-constant ERR_BID_EXISTS (err u426))
(define-constant ERR_TRANSFER_FAILED (err u405))

;; ============ STATUS CODES ============

;; Job Status
(define-constant JOB_OPEN u1)
(define-constant JOB_IN_PROGRESS u2)
(define-constant JOB_WORK_SUBMITTED u3)
(define-constant JOB_COMPLETED u4)
(define-constant JOB_DISPUTED u5)
(define-constant JOB_CANCELLED u6)

;; Bid Status
(define-constant BID_PENDING u1)
(define-constant BID_ACCEPTED u2)
(define-constant BID_REJECTED u3)
(define-constant BID_WITHDRAWN u4)

;; ============ DATA STRUCTURES ============

(define-map jobs
  { job-id: uint }
  {
    creator: principal,
    title: (string-utf8 200),
    description: (string-utf8 1000),
    budget: uint,
    deadline: uint,
    status: uint,
    selected-freelancer: (optional principal),
    work-submitted-by: (optional principal),
    work-submitted-at: (optional uint),
    work-description: (optional (string-utf8 500)),
    creator-feedback: (optional (string-utf8 500)),
    created-at: uint,
    category: (string-utf8 100)
  }
)

(define-map bids
  { job-id: uint, freelancer: principal }
  {
    bid-amount: uint,
    proposal: (string-utf8 500),
    bid-status: uint,
    submitted-at: uint
  }
)

(define-map disputes
  { job-id: uint }
  {
    raised-by: principal,
    reason: (string-utf8 500),
    raised-at: uint,
    resolved: bool,
    resolution: (optional (string-utf8 500))
  }
)

(define-data-var next-job-id uint u0)

;; ============ READ-ONLY FUNCTIONS ============

(define-read-only (get-total-jobs)
  (var-get next-job-id)
)

(define-read-only (get-job (job-id uint))
  (map-get? jobs { job-id: job-id })
)

(define-read-only (get-bid (job-id uint) (freelancer principal))
  (map-get? bids { job-id: job-id, freelancer: freelancer })
)

(define-read-only (get-dispute (job-id uint))
  (map-get? disputes { job-id: job-id })
)

(define-read-only (get-platform-owner)
  (var-get platform-owner)
)

(define-read-only (get-total-platform-fees)
  (var-get total-platform-fees)
)

(define-read-only (calculate-platform-fee (amount uint))
  (ok (/ (* amount PLATFORM_FEE_BPS) u10000))
)

(define-read-only (can-auto-release (job-id uint))
  (match (map-get? jobs { job-id: job-id })
    job
      (match (get work-submitted-at job)
        submitted-at
          (ok (and
            (is-eq (get status job) JOB_WORK_SUBMITTED)
            (>= burn-block-height (+ submitted-at AUTO_RELEASE_BLOCKS))
          ))
        (ok false)
      )
    (ok false)
  )
)

;; ============ PRIVATE FUNCTIONS ============

(define-private (transfer-usdcx (amount uint) (from principal) (to principal))
  (contract-call? USDCX_TOKEN transfer amount from to none)
)

(define-private (calc-fee (amount uint))
  (/ (* amount PLATFORM_FEE_BPS) u10000)
)

;; ============ PUBLIC FUNCTIONS ============

;; POST JOB
(define-public (post-job
  (title (string-utf8 200))
  (description (string-utf8 1000))
  (budget uint)
  (deadline uint)
  (category (string-utf8 100))
)
  (let ((job-id (var-get next-job-id)))
    ;; Validate inputs
    (asserts! (> budget u0) ERR_INVALID_AMOUNT)
    (asserts! (> deadline burn-block-height) ERR_DEADLINE_PASSED)

    ;; Lock budget in contract escrow
    (unwrap! (transfer-usdcx budget tx-sender (as-contract tx-sender)) ERR_TRANSFER_FAILED)

    ;; Create job
    (map-insert jobs
      { job-id: job-id }
      {
        creator: tx-sender,
        title: title,
        description: description,
        budget: budget,
        deadline: deadline,
        status: JOB_OPEN,
        selected-freelancer: none,
        work-submitted-by: none,
        work-submitted-at: none,
        work-description: none,
        creator-feedback: none,
        created-at: burn-block-height,
        category: category
      }
    )

    ;; Emit event
    (print {
      event: "job-posted",
      job-id: job-id,
      creator: tx-sender,
      budget: budget,
      category: category
    })

    (var-set next-job-id (+ job-id u1))
    (ok job-id)
  )
)

;; SUBMIT BID (FIXED)
(define-public (submit-bid
  (job-id uint)
  (bid-amount uint)
  (proposal (string-utf8 500))
)
  (let ((job (unwrap! (map-get? jobs { job-id: job-id }) ERR_NOT_FOUND)))
    ;; Validate bid
    (asserts! (is-eq (get status job) JOB_OPEN) ERR_JOB_NOT_ACTIVE)
    (asserts! (not (is-eq tx-sender (get creator job))) ERR_SELF_BID)
    (asserts! (> bid-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (<= bid-amount (get budget job)) ERR_INVALID_BID)
    (asserts! (< burn-block-height (get deadline job)) ERR_DEADLINE_PASSED)
    
    ;; Check if bid already exists
    (asserts! (is-none (map-get? bids { job-id: job-id, freelancer: tx-sender })) ERR_BID_EXISTS)

    ;; Submit bid
    (map-insert bids
      { job-id: job-id, freelancer: tx-sender }
      {
        bid-amount: bid-amount,
        proposal: proposal,
        bid-status: BID_PENDING,
        submitted-at: burn-block-height
      }
    )

    ;; Emit event
    (print {
      event: "bid-submitted",
      job-id: job-id,
      freelancer: tx-sender,
      bid-amount: bid-amount
    })

    (ok true)
  )
)

;; ACCEPT BID
(define-public (accept-bid (job-id uint) (freelancer principal))
  (let (
    (job (unwrap! (map-get? jobs { job-id: job-id }) ERR_NOT_FOUND))
    (bid (unwrap! (map-get? bids { job-id: job-id, freelancer: freelancer }) ERR_NOT_FOUND))
  )
    ;; Validate
    (asserts! (is-eq tx-sender (get creator job)) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get status job) JOB_OPEN) ERR_INVALID_STATUS)
    (asserts! (is-eq (get bid-status bid) BID_PENDING) ERR_INVALID_BID)

    ;; Update job status
    (map-set jobs
      { job-id: job-id }
      (merge job {
        status: JOB_IN_PROGRESS,
        selected-freelancer: (some freelancer)
      })
    )

    ;; Update bid status
    (map-set bids
      { job-id: job-id, freelancer: freelancer }
      (merge bid { bid-status: BID_ACCEPTED })
    )

    ;; Emit event
    (print {
      event: "bid-accepted",
      job-id: job-id,
      freelancer: freelancer
    })

    (ok true)
  )
)

;; SUBMIT WORK
(define-public (submit-work
  (job-id uint)
  (work-description (string-utf8 500))
)
  (let ((job (unwrap! (map-get? jobs { job-id: job-id }) ERR_NOT_FOUND)))
    ;; Validate
    (asserts! (is-eq (get status job) JOB_IN_PROGRESS) ERR_INVALID_STATUS)
    (asserts! (is-eq (some tx-sender) (get selected-freelancer job)) ERR_INVALID_FREELANCER)
    (asserts! (is-none (get work-submitted-by job)) ERR_WORK_ALREADY_SUBMITTED)

    ;; Update job
    (map-set jobs
      { job-id: job-id }
      (merge job {
        status: JOB_WORK_SUBMITTED,
        work-submitted-by: (some tx-sender),
        work-submitted-at: (some burn-block-height),
        work-description: (some work-description)
      })
    )

    ;; Emit event
    (print {
      event: "work-submitted",
      job-id: job-id,
      freelancer: tx-sender,
      submitted-at: burn-block-height
    })

    (ok true)
  )
)

;; APPROVE WORK & RELEASE PAYMENT
(define-public (approve-work
  (job-id uint)
  (feedback (string-utf8 500))
)
  (let (
    (job (unwrap! (map-get? jobs { job-id: job-id }) ERR_NOT_FOUND))
    (freelancer (unwrap! (get selected-freelancer job) ERR_INVALID_FREELANCER))
    (budget (get budget job))
    (fee (calc-fee budget))
    (payout (- budget fee))
  )
    ;; Validate
    (asserts! (is-eq tx-sender (get creator job)) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get status job) JOB_WORK_SUBMITTED) ERR_INVALID_STATUS)

    ;; Transfer payment to freelancer
    (as-contract (unwrap! (transfer-usdcx payout tx-sender freelancer) ERR_TRANSFER_FAILED))

    ;; Transfer platform fee
    (as-contract (unwrap! (transfer-usdcx fee tx-sender (var-get platform-owner)) ERR_TRANSFER_FAILED))

    ;; Update job status
    (map-set jobs
      { job-id: job-id }
      (merge job {
        status: JOB_COMPLETED,
        creator-feedback: (some feedback)
      })
    )

    ;; Update platform fees
    (var-set total-platform-fees (+ (var-get total-platform-fees) fee))

    ;; Emit event
    (print {
      event: "work-approved",
      job-id: job-id,
      freelancer: freelancer,
      payout: payout,
      platform-fee: fee
    })

    (ok true)
  )
)

;; AUTO-RELEASE PAYMENT (NEW FEATURE)
(define-public (auto-release-payment (job-id uint))
  (let (
    (job (unwrap! (map-get? jobs { job-id: job-id }) ERR_NOT_FOUND))
    (freelancer (unwrap! (get selected-freelancer job) ERR_INVALID_FREELANCER))
    (submitted-at (unwrap! (get work-submitted-at job) ERR_WORK_NOT_SUBMITTED))
    (budget (get budget job))
    (fee (calc-fee budget))
    (payout (- budget fee))
  )
    ;; Validate
    (asserts! (is-eq (get status job) JOB_WORK_SUBMITTED) ERR_INVALID_STATUS)
    (asserts! (>= burn-block-height (+ submitted-at AUTO_RELEASE_BLOCKS)) ERR_DEADLINE_PASSED)

    ;; Transfer payment to freelancer
    (as-contract (unwrap! (transfer-usdcx payout tx-sender freelancer) ERR_TRANSFER_FAILED))

    ;; Transfer platform fee
    (as-contract (unwrap! (transfer-usdcx fee tx-sender (var-get platform-owner)) ERR_TRANSFER_FAILED))

    ;; Update job status
    (map-set jobs
      { job-id: job-id }
      (merge job {
        status: JOB_COMPLETED,
        creator-feedback: (some u"Auto-released after timeout")
      })
    )

    ;; Update platform fees
    (var-set total-platform-fees (+ (var-get total-platform-fees) fee))

    ;; Emit event
    (print {
      event: "payment-auto-released",
      job-id: job-id,
      freelancer: freelancer,
      payout: payout
    })

    (ok true)
  )
)

;; CANCEL JOB (NEW FEATURE - CRITICAL!)
(define-public (cancel-job (job-id uint))
  (let ((job (unwrap! (map-get? jobs { job-id: job-id }) ERR_NOT_FOUND)))
    ;; Validate
    (asserts! (is-eq tx-sender (get creator job)) ERR_UNAUTHORIZED)
    (asserts! (or
      (is-eq (get status job) JOB_OPEN)
      (is-eq (get status job) JOB_IN_PROGRESS)
    ) ERR_INVALID_STATUS)
    (asserts! (is-none (get work-submitted-by job)) ERR_WORK_ALREADY_SUBMITTED)

    ;; Refund budget to creator
    (as-contract (unwrap! (transfer-usdcx (get budget job) tx-sender (get creator job)) ERR_TRANSFER_FAILED))

    ;; Update job status
    (map-set jobs
      { job-id: job-id }
      (merge job { status: JOB_CANCELLED })
    )

    ;; Emit event
    (print {
      event: "job-cancelled",
      job-id: job-id,
      refund: (get budget job)
    })

    (ok true)
  )
)

;; RAISE DISPUTE (NEW FEATURE)
(define-public (raise-dispute
  (job-id uint)
  (reason (string-utf8 500))
)
  (let ((job (unwrap! (map-get? jobs { job-id: job-id }) ERR_NOT_FOUND)))
    ;; Validate
    (asserts! (or
      (is-eq tx-sender (get creator job))
      (is-eq (some tx-sender) (get selected-freelancer job))
    ) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get status job) JOB_WORK_SUBMITTED) ERR_INVALID_STATUS)

    ;; Create dispute
    (map-insert disputes
      { job-id: job-id }
      {
        raised-by: tx-sender,
        reason: reason,
        raised-at: burn-block-height,
        resolved: false,
        resolution: none
      }
    )

    ;; Update job status
    (map-set jobs
      { job-id: job-id }
      (merge job { status: JOB_DISPUTED })
    )

    ;; Emit event
    (print {
      event: "dispute-raised",
      job-id: job-id,
      raised-by: tx-sender
    })

    (ok true)
  )
)

;; RESOLVE DISPUTE (PLATFORM OWNER ONLY)
(define-public (resolve-dispute
  (job-id uint)
  (refund-to-creator bool)
  (resolution (string-utf8 500))
)
  (let (
    (job (unwrap! (map-get? jobs { job-id: job-id }) ERR_NOT_FOUND))
    (dispute (unwrap! (map-get? disputes { job-id: job-id }) ERR_NOT_FOUND))
    (budget (get budget job))
    (fee (calc-fee budget))
    (payout (- budget fee))
    (recipient (if refund-to-creator (get creator job) (unwrap! (get selected-freelancer job) ERR_INVALID_FREELANCER)))
  )
    ;; Validate
    (asserts! (is-eq tx-sender (var-get platform-owner)) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get status job) JOB_DISPUTED) ERR_INVALID_STATUS)
    (asserts! (not (get resolved dispute)) ERR_INVALID_STATUS)

    ;; Transfer payment
    (as-contract (unwrap! (transfer-usdcx payout tx-sender recipient) ERR_TRANSFER_FAILED))

    ;; Transfer platform fee
    (as-contract (unwrap! (transfer-usdcx fee tx-sender (var-get platform-owner)) ERR_TRANSFER_FAILED))

    ;; Update dispute
    (map-set disputes
      { job-id: job-id }
      (merge dispute {
        resolved: true,
        resolution: (some resolution)
      })
    )

    ;; Update job
    (map-set jobs
      { job-id: job-id }
      (merge job { status: JOB_COMPLETED })
    )

    ;; Update platform fees
    (var-set total-platform-fees (+ (var-get total-platform-fees) fee))

    ;; Emit event
    (print {
      event: "dispute-resolved",
      job-id: job-id,
      refund-to-creator: refund-to-creator,
      recipient: recipient,
      payout: payout
    })

    (ok true)
  )
)

;; WITHDRAW BID (NEW FEATURE)
(define-public (withdraw-bid (job-id uint))
  (let (
    (job (unwrap! (map-get? jobs { job-id: job-id }) ERR_NOT_FOUND))
    (bid (unwrap! (map-get? bids { job-id: job-id, freelancer: tx-sender }) ERR_NOT_FOUND))
  )
    ;; Validate
    (asserts! (is-eq (get status job) JOB_OPEN) ERR_INVALID_STATUS)
    (asserts! (is-eq (get bid-status bid) BID_PENDING) ERR_INVALID_BID)

    ;; Update bid status
    (map-set bids
      { job-id: job-id, freelancer: tx-sender }
      (merge bid { bid-status: BID_WITHDRAWN })
    )

    ;; Emit event
    (print {
      event: "bid-withdrawn",
      job-id: job-id,
      freelancer: tx-sender
    })

    (ok true)
  )
)
