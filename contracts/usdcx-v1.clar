(define-trait sip-010-trait
  (
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
  )
)

(define-fungible-token usdcx)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (match (ft-transfer? usdcx amount sender recipient)
    result (ok result)
    error (err u1)
  )
)
