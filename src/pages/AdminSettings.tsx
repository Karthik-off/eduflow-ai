import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  Bell,
  Database,
  Mail,
  Globe,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Upload,
  Download,
  Key,
  Lock,
  Smartphone,
  Monitor,
  Palette,
  FileText,
  HelpCircle
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { toast } from 'sonner';

interface SystemSettings {
  general: {
    institutionName: string;
    institutionCode: string;
    academicYear: string;
    semester: string;
    timezone: string;
    dateFormat: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    attendanceAlerts: boolean;
    feeReminders: boolean;
    examNotifications: boolean;
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    twoFactorAuth: boolean;
    loginAttempts: number;
    passwordExpiry: number;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: string;
    backupLocation: string;
    lastBackup: string;
    retentionPeriod: number;
  };
  appearance: {
    theme: string;
    primaryColor: string;
    logo: string;
    favicon: string;
  };
  integration: {
    emailProvider: string;
    smsProvider: string;
    paymentGateway: string;
    cloudStorage: string;
  };
}

const AdminSettings = () => {
  const { user } = useAuthStore();
  const { isDarkMode } = useDarkMode();
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      institutionName: 'EduFlow University',
      institutionCode: 'EFU2024',
      academicYear: '2024-2025',
      semester: 'Fall 2024',
      timezone: 'UTC+05:30',
      dateFormat: 'DD/MM/YYYY'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      attendanceAlerts: true,
      feeReminders: true,
      examNotifications: true
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 30,
      twoFactorAuth: false,
      loginAttempts: 5,
      passwordExpiry: 90
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupLocation: 'cloud',
      lastBackup: '2024-04-11 10:30:00',
      retentionPeriod: 30
    },
    appearance: {
      theme: 'auto',
      primaryColor: '#3b82f6',
      logo: '/logo.png',
      favicon: '/favicon.ico'
    },
    integration: {
      emailProvider: 'smtp',
      smsProvider: 'twilio',
      paymentGateway: 'stripe',
      cloudStorage: 'aws-s3'
    }
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'backup', label: 'Backup', icon: <Database className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'integration', label: 'Integration', icon: <Globe className="w-4 h-4" /> }
  ];

  const handleSettingChange = (category: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setHasChanges(false);
      toast.success('Settings saved successfully');
    }, 1500);
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      setHasChanges(false);
      toast.success('Settings reset to defaults');
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'settings_backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Settings exported successfully');
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setSettings(imported);
          setHasChanges(true);
          toast.success('Settings imported successfully');
        } catch (error) {
          toast.error('Failed to import settings');
        }
      };
      reader.readAsText(file);
    }
  };

  const performBackup = async () => {
    setLoading(true);
    // Simulate backup process
    setTimeout(() => {
      setLoading(false);
      const now = new Date().toLocaleString();
      handleSettingChange('backup', 'lastBackup', now);
      toast.success('Backup completed successfully');
    }, 3000);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Institution Name</label>
          <Input
            value={settings.general.institutionName}
            onChange={(e) => handleSettingChange('general', 'institutionName', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Institution Code</label>
          <Input
            value={settings.general.institutionCode}
            onChange={(e) => handleSettingChange('general', 'institutionCode', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Academic Year</label>
          <Input
            value={settings.general.academicYear}
            onChange={(e) => handleSettingChange('general', 'academicYear', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Current Semester</label>
          <Input
            value={settings.general.semester}
            onChange={(e) => handleSettingChange('general', 'semester', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Timezone</label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="UTC+05:30">UTC+05:30 (India)</option>
            <option value="UTC+00:00">UTC+00:00 (GMT)</option>
            <option value="UTC-05:00">UTC-05:00 (EST)</option>
            <option value="UTC-08:00">UTC-08:00 (PST)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Date Format</label>
          <select
            value={settings.general.dateFormat}
            onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Notification Channels</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">Send notifications via email</div>
              </div>
            </div>
            <Switch
              checked={settings.notifications.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5" />
              <div>
                <div className="font-medium">SMS Notifications</div>
                <div className="text-sm text-muted-foreground">Send notifications via SMS</div>
              </div>
            </div>
            <Switch
              checked={settings.notifications.smsNotifications}
              onCheckedChange={(checked) => handleSettingChange('notifications', 'smsNotifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <div>
                <div className="font-medium">Push Notifications</div>
                <div className="text-sm text-muted-foreground">Send push notifications to mobile app</div>
              </div>
            </div>
            <Switch
              checked={settings.notifications.pushNotifications}
              onCheckedChange={(checked) => handleSettingChange('notifications', 'pushNotifications', checked)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Notification Types</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Attendance Alerts</div>
              <div className="text-sm text-muted-foreground">Notify about low attendance</div>
            </div>
            <Switch
              checked={settings.notifications.attendanceAlerts}
              onCheckedChange={(checked) => handleSettingChange('notifications', 'attendanceAlerts', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Fee Reminders</div>
              <div className="text-sm text-muted-foreground">Send fee payment reminders</div>
            </div>
            <Switch
              checked={settings.notifications.feeReminders}
              onCheckedChange={(checked) => handleSettingChange('notifications', 'feeReminders', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Exam Notifications</div>
              <div className="text-sm text-muted-foreground">Notify about exam schedules and results</div>
            </div>
            <Switch
              checked={settings.notifications.examNotifications}
              onCheckedChange={(checked) => handleSettingChange('notifications', 'examNotifications', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Minimum Password Length</label>
          <Input
            type="number"
            value={settings.security.passwordMinLength}
            onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
          <Input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Max Login Attempts</label>
          <Input
            type="number"
            value={settings.security.loginAttempts}
            onChange={(e) => handleSettingChange('security', 'loginAttempts', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Password Expiry (days)</label>
          <Input
            type="number"
            value={settings.security.passwordExpiry}
            onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Security Features</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5" />
              <div>
                <div className="font-medium">Two-Factor Authentication</div>
                <div className="text-sm text-muted-foreground">Require 2FA for admin accounts</div>
              </div>
            </div>
            <Switch
              checked={settings.security.twoFactorAuth}
              onCheckedChange={(checked) => handleSettingChange('security', 'twoFactorAuth', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Automatic Backup</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enable Auto Backup</div>
              <div className="text-sm text-muted-foreground">Automatically backup system data</div>
            </div>
            <Switch
              checked={settings.backup.autoBackup}
              onCheckedChange={(checked) => handleSettingChange('backup', 'autoBackup', checked)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Backup Frequency</label>
              <select
                value={settings.backup.backupFrequency}
                onChange={(e) => handleSettingChange('backup', 'backupFrequency', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Backup Location</label>
              <select
                value={settings.backup.backupLocation}
                onChange={(e) => handleSettingChange('backup', 'backupLocation', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="cloud">Cloud Storage</option>
                <option value="local">Local Server</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Retention Period (days)</label>
            <Input
              type="number"
              value={settings.backup.retentionPeriod}
              onChange={(e) => handleSettingChange('backup', 'retentionPeriod', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Backup Status</h3>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Last Backup:</span>
            <span className="text-sm">{settings.backup.lastBackup}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Successful
            </Badge>
          </div>
        </div>
        <Button onClick={performBackup} disabled={loading} className="w-full">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Backing up...' : 'Perform Manual Backup'}
        </Button>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <select
            value={settings.appearance.theme}
            onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="auto">Auto</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Primary Color</label>
          <Input
            type="color"
            value={settings.appearance.primaryColor}
            onChange={(e) => handleSettingChange('appearance', 'primaryColor', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Logo URL</label>
          <Input
            value={settings.appearance.logo}
            onChange={(e) => handleSettingChange('appearance', 'logo', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Favicon URL</label>
          <Input
            value={settings.appearance.favicon}
            onChange={(e) => handleSettingChange('appearance', 'favicon', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Email Provider</label>
          <select
            value={settings.integration.emailProvider}
            onChange={(e) => handleSettingChange('integration', 'emailProvider', e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="smtp">SMTP</option>
            <option value="sendgrid">SendGrid</option>
            <option value="mailgun">Mailgun</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">SMS Provider</label>
          <select
            value={settings.integration.smsProvider}
            onChange={(e) => handleSettingChange('integration', 'smsProvider', e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="twilio">Twilio</option>
            <option value="plivo">Plivo</option>
            <option value="messagebird">MessageBird</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Payment Gateway</label>
          <select
            value={settings.integration.paymentGateway}
            onChange={(e) => handleSettingChange('integration', 'paymentGateway', e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
            <option value="razorpay">RazorPay</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Cloud Storage</label>
          <select
            value={settings.integration.cloudStorage}
            onChange={(e) => handleSettingChange('integration', 'cloudStorage', e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="aws-s3">AWS S3</option>
            <option value="google-cloud">Google Cloud</option>
            <option value="azure">Azure Blob</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'backup': return renderBackupSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'integration': return renderIntegrationSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <AdminLayout title="System Settings">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            System Settings
          </h1>
          <p className="text-muted-foreground mt-1">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSettings}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
          <Button variant="outline" onClick={resetSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={loading || !hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Alert for unsaved changes */}
      {hasChanges && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                You have unsaved changes. Remember to save your settings.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card>
          <CardContent className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                    }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="capitalize">{activeTab} Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
