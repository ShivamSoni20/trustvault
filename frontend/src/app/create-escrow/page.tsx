'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useWallet } from '@/hooks/useWallet';
import { createEscrow } from '@/services/contractService';
import { useUIStore } from '@/store/uiStore';
import { isValidStacksAddress } from '@/utils/validators';
import { formatUSDCx, formatDate } from '@/utils/formatters';
import { CATEGORIES } from '@/utils/constants';
import { cn } from '@/lib/utils';

interface FormData {
  projectTitle: string;
  projectDescription: string;
  category: string;
  freelancerAddress: string;
  amount: number;
  deadline: string;
}

const steps = [
  { id: 1, title: 'Project Details', description: 'Describe your project' },
  { id: 2, title: 'Payment Details', description: 'Set payment terms' },
  { id: 3, title: 'Review', description: 'Confirm and create' },
];

export default function CreateEscrowPage() {
  const router = useRouter();
  const { address, isConnected, balance, connectWallet } = useWallet();
  const { addToast } = useUIStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEscrowId, setCreatedEscrowId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    defaultValues: {
      category: 'Web Development',
    },
  });

  const watchedValues = watch();

  const handleNext = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['projectTitle', 'projectDescription', 'category'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['freelancerAddress', 'amount', 'deadline'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: FormData) => {
    if (!isConnected || !address) {
      addToast({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet to create an escrow',
      });
      return;
    }

    if (data.freelancerAddress === address) {
      addToast({
        type: 'error',
        title: 'Invalid Freelancer',
        message: 'You cannot create an escrow with yourself',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const metadata = JSON.stringify({
        title: data.projectTitle,
        description: data.projectDescription,
        category: data.category,
      });

      const result = await createEscrow(
        data.freelancerAddress,
        data.amount,
        new Date(data.deadline),
        metadata
      );

      setCreatedEscrowId(result.txId);
      addToast({
        type: 'success',
        title: 'Escrow Created!',
        message: 'Your transaction has been submitted',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create escrow';
      addToast({
        type: 'error',
        title: 'Transaction Failed',
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdEscrowId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="text-center">
          <CardContent className="py-12">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Escrow Created!</h2>
            <p className="text-slate-400 mb-6">
              Your escrow transaction has been submitted to the blockchain.
            </p>
            <div className="bg-background rounded-lg p-4 mb-6">
              <p className="text-xs text-slate-400 mb-1">Transaction ID</p>
              <p className="font-mono text-sm break-all">{createdEscrowId}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://explorer.hiro.so/txid/${createdEscrowId}?chain=testnet`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" className="gap-2 w-full">
                  View on Explorer
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Escrow</h1>
        <p className="text-slate-400">
          Set up a secure payment for your freelance project
        </p>
      </div>

      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                  currentStep > step.id
                    ? 'bg-green-500 text-white'
                    : currentStep === step.id
                    ? 'bg-primary text-white'
                    : 'bg-surface text-slate-400'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.id
                )}
              </div>
              <span className="text-xs mt-2 text-center hidden sm:block">
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-16 sm:w-24 h-1 mx-2',
                  currentStep > step.id ? 'bg-green-500' : 'bg-surface'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {!isConnected && (
        <Card className="mb-6 border-amber-500/50 bg-amber-500/10">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-200">
                Connect your wallet to create an escrow
              </p>
            </div>
            <Button onClick={connectWallet} size="sm">
              Connect
            </Button>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <div className="space-y-6">
                <Input
                  label="Project Title"
                  placeholder="e.g., Website Redesign"
                  {...register('projectTitle', {
                    required: 'Project title is required',
                    maxLength: { value: 100, message: 'Max 100 characters' },
                  })}
                  error={errors.projectTitle?.message}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Project Description
                  </label>
                  <textarea
                    className="input-field min-h-[120px] resize-none"
                    placeholder="Describe the project scope and deliverables..."
                    {...register('projectDescription', {
                      required: 'Description is required',
                      maxLength: { value: 500, message: 'Max 500 characters' },
                    })}
                  />
                  {errors.projectDescription && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.projectDescription.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    className="input-field"
                    {...register('category', { required: 'Category is required' })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <Input
                  label="Freelancer Stacks Address"
                  placeholder="ST..."
                  {...register('freelancerAddress', {
                    required: 'Freelancer address is required',
                    validate: (value) =>
                      isValidStacksAddress(value) || 'Invalid Stacks address format',
                  })}
                  error={errors.freelancerAddress?.message}
                  hint="The address that will receive the payment"
                />

                <Input
                  label="Payment Amount (USDCx)"
                  type="number"
                  step="0.000001"
                  placeholder="100.00"
                  {...register('amount', {
                    required: 'Amount is required',
                    min: { value: 0.000001, message: 'Minimum amount is 0.000001' },
                    max: { value: 1000000, message: 'Maximum amount is 1,000,000' },
                    valueAsNumber: true,
                  })}
                  error={errors.amount?.message}
                  hint={isConnected ? `Your balance: ${balance.toFixed(6)} STX` : undefined}
                />

                <Input
                  label="Deadline"
                  type="date"
                  {...register('deadline', {
                    required: 'Deadline is required',
                    validate: (value) => {
                      const date = new Date(value);
                      const minDate = new Date();
                      minDate.setDate(minDate.getDate() + 1);
                      return date >= minDate || 'Deadline must be at least 1 day from now';
                    },
                  })}
                  error={errors.deadline?.message}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-background rounded-lg p-4 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Project Title</span>
                    <span className="font-medium">{watchedValues.projectTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category</span>
                    <span className="font-medium">{watchedValues.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Freelancer</span>
                    <span className="font-mono text-sm">
                      {watchedValues.freelancerAddress?.slice(0, 10)}...
                      {watchedValues.freelancerAddress?.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount</span>
                    <span className="font-semibold text-accent">
                      {formatUSDCx(watchedValues.amount * 1000000)} USDCx
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deadline</span>
                    <span>{watchedValues.deadline && formatDate(new Date(watchedValues.deadline))}</span>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <p className="text-sm text-slate-300">
                    By creating this escrow, you agree to deposit{' '}
                    <strong>{formatUSDCx(watchedValues.amount * 1000000)} USDCx</strong> into the
                    smart contract. Funds will be held until you approve release or a
                    dispute is resolved.
                  </p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 w-4 h-4 rounded border-slate-600 bg-background text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-slate-300">
                    I understand this transaction is irreversible and funds will be locked
                    in the smart contract until released.
                  </span>
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < 3 ? (
            <Button type="button" onClick={handleNext} className="gap-2">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!isConnected || isSubmitting}
              isLoading={isSubmitting}
              className="gap-2"
            >
              Create Escrow
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
