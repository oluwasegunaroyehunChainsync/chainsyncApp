/**
 * Settings Page
 * Comprehensive user settings for ChainSync platform
 * All settings are persisted and applied globally across the app
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { SUPPORTED_CHAINS } from '@/constants';
import { useTransferStore } from '@/stores/transferStore';
import { useSettingsStore, type SettingsState } from '@/stores/settingsStore';
import {
  Settings as SettingsIcon,
  Monitor,
  Send,
  Bell,
  Network,
  Shield,
  Database,
  Sun,
  Moon,
  Download,
  Trash2,
  RefreshCw,
  Check,
} from 'lucide-react';

// Settings keys that can be updated
type SettingsKey = keyof Omit<SettingsState, 'updateSetting' | 'resetSettings' | 'applyTheme'>;

export default function Settings() {
  const { transfers } = useTransferStore();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  // Get all settings from global store
  const {
    currency,
    theme,
    slippageTolerance,
    gasSpeed,
    autoFillRecipient,
    defaultRecipient,
    browserNotifications,
    emailNotifications,
    notifyOnComplete,
    notifyOnFailed,
    defaultChain,
    customRpcEnabled,
    customRpcUrl,
    sessionTimeout,
    confirmationThreshold,
    requireConfirmation,
    updateSetting,
    resetSettings,
  } = useSettingsStore();

  // Show saved feedback
  const showSaved = () => {
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  // Handle setting change with feedback
  const handleChange = (key: SettingsKey, value: SettingsState[SettingsKey]) => {
    updateSetting(key, value);
    showSaved();
  };

  // Reset to defaults
  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      resetSettings();
      showSaved();
    }
  };

  // Clear transfer history
  const clearTransferHistory = () => {
    if (window.confirm('Are you sure you want to clear all transfer history? This action cannot be undone.')) {
      localStorage.removeItem('transfer-storage');
      window.location.reload();
    }
  };

  // Export transfer history as CSV
  const exportTransferHistory = () => {
    if (transfers.length === 0) {
      alert('No transfer history to export.');
      return;
    }

    const headers = ['ID', 'Source Chain', 'Destination Chain', 'Amount', 'Asset', 'Status', 'Date'];
    const rows = transfers.map(t => [
      t.id,
      SUPPORTED_CHAINS[t.sourceChain]?.name || t.sourceChain,
      SUPPORTED_CHAINS[t.destinationChain]?.name || t.destinationChain,
      t.amount,
      t.asset,
      t.status,
      new Date(t.timestamp).toISOString(),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chainsync-transfers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        handleChange('browserNotifications', true);
        new Notification('ChainSync Notifications Enabled', {
          body: 'You will now receive notifications for transfer updates.',
          icon: '/favicon.ico',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your ChainSync preferences</p>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-green-600 text-sm">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <Tabs defaultValue="display" className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="display" className="gap-2">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Display</span>
          </TabsTrigger>
          <TabsTrigger value="transfer" className="gap-2">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Transfer</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="network" className="gap-2">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">Network</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
        </TabsList>

        {/* Display Settings */}
        <TabsContent value="display" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Display Preferences
              </CardTitle>
              <CardDescription>
                Customize how ChainSync looks and displays information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Currency */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="currency" className="text-base">Display Currency</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred currency for value display</p>
                </div>
                <Select
                  value={currency}
                  onValueChange={(value) => handleChange('currency', value as any)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (&euro;)</SelectItem>
                    <SelectItem value="GBP">GBP (&pound;)</SelectItem>
                    <SelectItem value="ETH">ETH (&Xi;)</SelectItem>
                    <SelectItem value="BTC">BTC (&bitcoin;)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Theme */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred color theme</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleChange('theme', 'light')}
                  >
                    <Sun className="h-4 w-4 mr-1" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleChange('theme', 'dark')}
                  >
                    <Moon className="h-4 w-4 mr-1" />
                    Dark
                  </Button>
                </div>
              </div>

              {/* Current Theme Preview */}
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Current theme: <strong className="text-gray-900 dark:text-white">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Theme changes are applied immediately across the entire app.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfer Defaults */}
        <TabsContent value="transfer" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Transfer Defaults
              </CardTitle>
              <CardDescription>
                Set default values for your token transfers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Slippage Tolerance */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="slippage" className="text-base">Slippage Tolerance</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Maximum acceptable price change during transfer</p>
                </div>
                <Select
                  value={slippageTolerance}
                  onValueChange={(value) => handleChange('slippageTolerance', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.1">0.1%</SelectItem>
                    <SelectItem value="0.5">0.5%</SelectItem>
                    <SelectItem value="1.0">1.0%</SelectItem>
                    <SelectItem value="2.0">2.0%</SelectItem>
                    <SelectItem value="5.0">5.0%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Gas Speed */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Default Gas Speed</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Preferred transaction speed (affects fees)</p>
                </div>
                <Select
                  value={gasSpeed}
                  onValueChange={(value) => handleChange('gasSpeed', value as any)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Slow</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="fast">Fast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Auto-fill Recipient */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Auto-fill Recipient</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Automatically use a default recipient address</p>
                </div>
                <Switch
                  checked={autoFillRecipient}
                  onCheckedChange={(checked) => handleChange('autoFillRecipient', checked)}
                />
              </div>

              {autoFillRecipient && (
                <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  <Label htmlFor="defaultRecipient">Default Recipient Address</Label>
                  <Input
                    id="defaultRecipient"
                    placeholder="0x..."
                    value={defaultRecipient}
                    onChange={(e) => handleChange('defaultRecipient', e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Browser Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Browser Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive desktop notifications for important events</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={browserNotifications}
                    onCheckedChange={(checked) => {
                      if (checked && 'Notification' in window && Notification.permission !== 'granted') {
                        requestNotificationPermission();
                      } else {
                        handleChange('browserNotifications', checked);
                      }
                    }}
                  />
                  {browserNotifications && 'Notification' in window && Notification.permission !== 'granted' && (
                    <Button size="sm" variant="outline" onClick={requestNotificationPermission}>
                      Enable
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates for transfers (coming soon)</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
                  disabled
                />
              </div>

              <Separator />

              {/* Notify on Complete */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Transfer Completion Alerts</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when transfers complete successfully</p>
                </div>
                <Switch
                  checked={notifyOnComplete}
                  onCheckedChange={(checked) => handleChange('notifyOnComplete', checked)}
                />
              </div>

              <Separator />

              {/* Notify on Failed */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Transfer Failure Alerts</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when transfers fail</p>
                </div>
                <Switch
                  checked={notifyOnFailed}
                  onCheckedChange={(checked) => handleChange('notifyOnFailed', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Settings */}
        <TabsContent value="network" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Network Configuration
              </CardTitle>
              <CardDescription>
                Configure blockchain network preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default Chain */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Default Network</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Preferred network for new transfers</p>
                </div>
                <Select
                  value={String(defaultChain)}
                  onValueChange={(value) => handleChange('defaultChain', Number(value))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SUPPORTED_CHAINS).map((chain) => (
                      <SelectItem key={chain.id} value={String(chain.id)}>
                        {chain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Custom RPC */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Use Custom RPC</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Override default RPC endpoints with your own</p>
                </div>
                <Switch
                  checked={customRpcEnabled}
                  onCheckedChange={(checked) => handleChange('customRpcEnabled', checked)}
                />
              </div>

              {customRpcEnabled && (
                <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  <Label htmlFor="customRpc">Custom RPC URL</Label>
                  <Input
                    id="customRpc"
                    placeholder="https://..."
                    value={customRpcUrl}
                    onChange={(e) => handleChange('customRpcUrl', e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Make sure the RPC URL supports the selected default network
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security and safety features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Session Timeout */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Session Timeout</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Auto-disconnect wallet after inactivity (minutes)</p>
                </div>
                <Select
                  value={String(sessionTimeout)}
                  onValueChange={(value) => handleChange('sessionTimeout', Number(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="0">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Require Confirmation */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Require Transfer Confirmation</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Show confirmation dialog for large transfers</p>
                </div>
                <Switch
                  checked={requireConfirmation}
                  onCheckedChange={(checked) => handleChange('requireConfirmation', checked)}
                />
              </div>

              {requireConfirmation && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Confirmation Threshold</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Require confirmation for transfers above this USD value</p>
                    </div>
                    <Select
                      value={confirmationThreshold}
                      onValueChange={(value) => handleChange('confirmationThreshold', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">$100</SelectItem>
                        <SelectItem value="500">$500</SelectItem>
                        <SelectItem value="1000">$1,000</SelectItem>
                        <SelectItem value="5000">$5,000</SelectItem>
                        <SelectItem value="10000">$10,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Manage your local data and export history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Export History */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Export Transfer History</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Download your transfer history as a CSV file ({transfers.length} transfers)
                  </p>
                </div>
                <Button variant="outline" onClick={exportTransferHistory}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <Separator />

              {/* Clear History */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base text-red-600">Clear Transfer History</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Remove all locally stored transfer data. This cannot be undone.
                  </p>
                </div>
                <Button variant="destructive" onClick={clearTransferHistory}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              </div>

              <Separator />

              {/* Storage Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Storage Information</h4>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p>Transfer records: {transfers.length}</p>
                  <p>Settings: Saved to browser</p>
                  <p>Current currency: {currency}</p>
                  <p>Current theme: {theme}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Data is stored locally in your browser. Connect your wallet to sync with the blockchain.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
