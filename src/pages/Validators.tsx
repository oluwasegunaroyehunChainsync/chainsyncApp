import React, { useState } from 'react';
import { useValidatorStore, notify } from '@/stores';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function Validators() {
  const { validators, stakingPositions, stake, claimRewards } = useValidatorStore();
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);

  const handleStake = async () => {
    if (!selectedValidator || !stakeAmount) {
      notify.error('Please select a validator and enter an amount');
      return;
    }

    setIsStaking(true);
    try {
      await stake(selectedValidator, stakeAmount);
      notify.success(`Successfully staked ${stakeAmount} ETH!`);
      setStakeAmount('');
      setSelectedValidator(null);
    } catch (error) {
      notify.error('Staking failed');
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaimRewards = async (positionId: string) => {
    try {
      await claimRewards(positionId);
      notify.success('Rewards claimed successfully!');
    } catch (error) {
      notify.error('Failed to claim rewards');
    }
  };

  return (
    <div className="container px-4 sm:px-6 md:px-8 mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Validators & Staking</h1>
        <p className="text-gray-600 mt-1">Earn rewards by staking with network validators</p>
      </div>

      {/* Your Stakes */}
      {stakingPositions.length > 0 && (
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-xl font-bold text-gray-900">Your Staking Positions</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3">
              {stakingPositions.map((position) => (
                <div key={position.id} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{position.validatorName}</p>
                      <p className="text-sm text-gray-600 mt-1">{position.amount} ETH staked @ {position.apy} APY</p>
                    </div>
                    <span className="text-lg font-bold text-green-600">+{position.claimableRewards} ETH</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClaimRewards(position.id)}
                  >
                    Claim Rewards
                  </Button>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Validators List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card variant="elevated">
            <Card.Header>
              <h2 className="text-xl font-bold text-gray-900">Available Validators</h2>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3">
                {validators.map((validator) => (
                  <div
                    key={validator.id}
                    onClick={() => setSelectedValidator(validator.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedValidator === validator.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{validator.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{validator.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{validator.apy}</p>
                        <p className="text-xs text-gray-600">APY</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-gray-600">Commission</p>
                        <p className="font-semibold text-gray-900">{validator.commission}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Uptime</p>
                        <p className="font-semibold text-gray-900">{validator.uptime}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Delegators</p>
                        <p className="font-semibold text-gray-900">{validator.delegators}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Staking Form */}
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-xl font-bold text-gray-900">Stake Now</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            {selectedValidator ? (
              <>
                <div>
                  <p className="text-gray-600 text-sm">Selected Validator</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {validators.find((v) => v.id === selectedValidator)?.name}
                  </p>
                </div>
                <Input
                  label="Amount (ETH)"
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.00"
                  helperText="Minimum 0.1 ETH"
                />
                <Button
                  variant="primary"
                  fullWidth
                  isLoading={isStaking}
                  onClick={handleStake}
                  className="w-full md:w-auto"
                >
                  {isStaking ? 'Staking...' : 'Stake Now'}
                </Button>
              </>
            ) : (
              <p className="text-gray-600 text-center py-8">Select a validator to stake</p>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="outlined">
          <Card.Body className="space-y-3">
            <p className="text-3xl">📈</p>
            <h3 className="font-semibold text-gray-900">Earn Rewards</h3>
            <p className="text-sm text-gray-600">Passive income from staking your assets</p>
          </Card.Body>
        </Card>
        <Card variant="outlined">
          <Card.Body className="space-y-3">
            <p className="text-3xl">🔒</p>
            <h3 className="font-semibold text-gray-900">Secure Network</h3>
            <p className="text-sm text-gray-600">Help secure the ChainSync protocol</p>
          </Card.Body>
        </Card>
        <Card variant="outlined">
          <Card.Body className="space-y-3">
            <p className="text-3xl">🎯</p>
            <h3 className="font-semibold text-gray-900">Flexible</h3>
            <p className="text-sm text-gray-600">Unstake anytime with no lock-up period</p>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
