export function isValidStacksAddress(address: string): boolean {
  const stacksAddressRegex = /^S[PT][A-Z0-9]{38,40}$/;
  return stacksAddressRegex.test(address);
}

export function isValidAmount(amount: number): boolean {
  return amount > 0 && amount <= 1_000_000;
}

export function isValidDeadline(date: Date): boolean {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  
  return date >= minDate && date <= maxDate;
}

export function validateCreateEscrow(data: {
  freelancer: string;
  amount: number;
  deadline: Date;
  clientAddress: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isValidStacksAddress(data.freelancer)) {
    errors.push('Invalid freelancer address format');
  }

  if (data.freelancer === data.clientAddress) {
    errors.push('Cannot create escrow with yourself');
  }

  if (!isValidAmount(data.amount)) {
    errors.push('Amount must be between 0 and 1,000,000 USDCx');
  }

  if (!isValidDeadline(data.deadline)) {
    errors.push('Deadline must be between 1 day and 1 year from now');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
