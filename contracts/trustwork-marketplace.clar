;; TrustWork Marketplace - Job Platform with Bidding & Auto-Release
;; Replaces previous usdcx-escrow with enhanced functionality
;; Token: USDCx (ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

;; ============ CONSTANTS ============

(define-constant USDCX_TOKEN .usdcx-v1)
(define-constant USDCX_CONTRACT_NAME "usdcx-v1")
(define-constant PLATFORM_FEE_BPS u200) ;; 2%

(define-data-var platform-owner principal tx-sender)

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

(define-read-only (get-platform-owner)
  (var-get platform-owner)
)

(define-read-only (calculate-platform-fee (amount uint))
  (ok (/ (* amount PLATFORM_FEE_BPS) u10000))
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
    (asserts! (> budget u0) ERR_INVALID_AMOUNT)
    (asserts! (> deadline burn-block-height) ERR_DEADLINE_PASSED)

    (try! (transfer-usdcx budget tx-sender (as-contract tx-sender)))

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
        work-description: none,
        creator-feedback: none,
        created-at: burn-block-height,
        category: category
      }
    )

    (var-set next-job-id (+ job-id u1))
    (ok job-id)
  )
)

;; SUBMIT BID
(define-public (submit-bid
  (job-id uint)
  (bid-amount uint)
  (proposal (string-utf8 500))
)
  (let ((job (unwrap! (map-get? jobs { job-id: job-id }) ERR_NOT_FOUND)))
    (asserts! (is-eq (get status job) JOB_OPEN) ERR_JOB_NOT_ACTIVE)
    (asserts! (> bid-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (<= bid-amount (get budget job)) ERR_INVALID_BID)
    (asserts! (not (is-eq tx-sender (get creator job))) ERR_SELF_BID)

    (try! (transfer-usdcx bid-amount tx-sender (as-contract tx-sender)))

    (map-insert bids
      { job-id: job-id, freelancer: tx-sender }
      {
        bid-amount: bid-amount,
        proposal: proposal,
        bid-status: BID_PENDING,
        submitted-at: burn-block-height
      }
    )

    (ok true)
  )
)

;; WITHDRAW BID
(define-public (withdraw-bid (job-id uint))
  (let (
    (bid (unwrap! (map-get? bids { job-id: job-id, freelancer: tx-sender }) ERR_NOT_FOUND))
  )
    (asserts! (is-eq (get bid-status bid) BID_PENDING) ERR_INVALID_STATUS)

    (try! (as-contract (transfer-usdcx (get bid-amount bid) (as-contract tx-sender) tx-sender)))

    (map-set bids
      { job-id: job-id, freelancer: tx-sender }
      (merge bid { bid-status: BID_WITHDRAWN })
    )

    (ok true)
  )
)

;; ACCEPT BID (Select Freelancer)
(define-public (accept-bid (job-id uint) (freelancer principal))
  (let (
    (job (unwrap! (map-get? jobs { job-id: job-id }) ERR_NOT_FOUND))
    (bid (unwrap! (map-get? bids { job-id: job-id, freelancer: freelancer }) ERR_NOT_FOUND))
  )
    (asserts! (is-eq tx-sender (get creator job)) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get status job) JOB_OPEN) ERR_JOB_NOT_ACTIVE)
    (asserts! (is-eq (get bid-status bid) BID_PENDING) ERR_INVALID_BID)

    (map-set jobs
      { job-id: job-id }
      (merge job { 
        status: JOB_IN_PROGRESS,
        selected-freelancer: (some freelancer)
      })
    )

    (map-set bids
      { job-id: job-id, freelancer: freelancer }
      (merge bid { bid-status: BID_ACCEPTED })
    )

    (ok true)
  )
)

;; REJECT BID
(define-public (reject-bid (job-id uint) (freelancer principal))
  (let (
    (job (unwrap! (map-get? jobs { job-id: job-id }) ERR_NOT_FOUND))
    (bid (unwrap! (map-get? bids { job-id: job-id, freelancer: freelancer }) ERR_NOT_FOUND))
  )
    (asserts! (is-eq tx-sender (get creator job)) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get status job) JOB_OPEN) ERR_JOB_NOT_ACTIVE)
    (asserts! (is-eq (get bid-status bid) BID_PENDING) ERR_INVALID_BID)

    (try! (as-contract (transfer-usdcx (get bid-amount bid) (as-contract tx-sender) freelancer)))

    (map-set bids
      { job-id: job-id, freelancer: freelancer }
      (merge bid { bid-status: BID_REJECTED })
    )

    (ok true)
  )
)

;; SUBMIT WORK
(define-public (submit-work (job-id uint) (work-description (string-utf8 500)))
  (let ((job (unwrap! (map-get? jobs { job-id: job-id }) ERR_NOT_FOUND)))
    (asserts! (is-eq (get selected-freelancer job) (some tx-sender)) ERR_INVALID_FREELANCER)
    (asserts! (is-eq (get status job) JOB_IN_PROGRESS) ERR_JOB_NOT_ACTIVE)
    (asserts! (is-none (get work-submitted-by job)) ERR_WORK_ALREADY_SUBMITTED)

    (map-set jobs
      { job-id: job-id }
      (merge job {
        status: JOB_WORK_SUBMITTED,
        work-submitted-by: (some tx-sender),
        work-description: (some work-description)
      })
    )

    (ok true)
  )
)

;; APPROVE WORK - AUTO RELEASES FUNDS
(define-public (approve-work (job-id uint))
  (let (
    (job (unwrap! (map-get? jobs { job-id: job-id }) ERR_NOT_FOUND))
    (freelancer (unwrap! (get selected-freelancer job) ERR_NOT_FOUND))
    (bid (unwrap! (map-get? bids { job-id: job-id, freelancer: freelancer }) ERR_NOT_FOUND))
    (bid-amount (get bid-amount bid))
    (fee (calc-fee bid-amount))
    (freelancer-payment (- bid-amount fee))
  )
    (asserts! (is-eq tx-sender (get creator job)) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get status job) JOB_WORK_SUBMITTED) ERR_WORK_NOT_SUBMITTED)

    ;; AUTO-RELEASE: Transfer to freelancer
    (try! (as-contract (transfer-usdcx freelancer-payment (as-contract tx-sender) freelancer)))

    ;; Transfer platform fee
    (try! (as-contract (transfer-usdcx fee (as-contract tx-sender) (var-get platform-owner))))

    ;; Update job status
    (map-set jobs
      { job-id: job-id }
      (merge job { status: JOB_COMPLETED })
    )

    (ok true)
  )
)

;; REJECT WORK
(define-public (reject-work (job-id uint) (rejection-reason (string-utf8 500)))
  (let ((job (unwrap! (map-get? jobs { job-id: job-id }) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get creator job)) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get status job) JOB_WORK_SUBMITTED) ERR_WORK_NOT_SUBMITTED)

    (map-set jobs
      { job-id: job-id }
      (merge job {
        status: JOB_DISPUTED,
        creator-feedback: (some rejection-reason)
      })
    )

    (ok true)
  )
)

;; RESOLVE DISPUTE
(define-public (resolve-dispute (job-id uint) (resolution uint))
  (let (
    (job (unwrap! (map-get? jobs { job-id: job-id }) ERR_NOT_FOUND))
    (freelancer (unwrap! (get selected-freelancer job) ERR_NOT_FOUND))
    (bid (unwrap! (map-get? bids { job-id: job-id, freelancer: freelancer }) ERR_NOT_FOUND))
    (bid-amount (get bid-amount bid))
  )
    (asserts! (is-eq tx-sender (var-get platform-owner)) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get status job) JOB_DISPUTED) ERR_INVALID_STATUS)

    (if (is-eq resolution u0)
      ;; Refund creator
      (try! (as-contract (transfer-usdcx (get budget job) (as-contract tx-sender) (get creator job))))
      ;; Release to freelancer
      (let ((fee (calc-fee bid-amount))
            (freelancer-payment (- bid-amount fee)))
        (try! (as-contract (transfer-usdcx freelancer-payment (as-contract tx-sender) freelancer)))
        (try! (as-contract (transfer-usdcx fee (as-contract tx-sender) (var-get platform-owner))))
      )
    )

    (map-set jobs
      { job-id: job-id }
      (merge job { status: JOB_COMPLETED })
    )

    (ok true)
  )
)

;; CANCEL JOB
(define-public (cancel-job (job-id uint))
  (let ((job (unwrap! (map-get? jobs { job-id: job-id }) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get creator job)) ERR_UNAUTHORIZED)
    (asserts! (is-none (get work-submitted-by job)) ERR_INVALID_STATUS)

    (try! (as-contract (transfer-usdcx (get budget job) (as-contract tx-sender) tx-sender)))

    (map-set jobs
      { job-id: job-id }
      (merge job { status: JOB_CANCELLED })
    )

    (ok true)
  )
)

;; SET PLATFORM OWNER
(define-public (set-platform-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get platform-owner)) ERR_UNAUTHORIZED)
    (var-set platform-owner new-owner)
    (ok true)
  )
)
