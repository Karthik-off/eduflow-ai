import { useState } from 'react';
import StudentLayoutWithSearch from '@/components/layouts/StudentLayoutWithSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  Shield,
  Smartphone,
  Laptop,
  Volume2,
  Wifi,
  HelpCircle,
  LogOut,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    desktop: true
  });
  const [language, setLanguage] = useState('english');
  const [autoSave, setAutoSave] = useState(true);
  const [dataUsage, setDataUsage] = useState('wifi-only');

  const handleSaveSettings = () => {
    // Save settings logic here
    console.log('Settings saved');
  };

  const handleLogout = () => {
    // Logout logic here
    console.log('Logging out');
  };

  return (
    <StudentLayoutWithSearch title="Settings">
      <div className="space-y-6">
        {/* Profile Settings */}
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">First Name</label>
                <Input 
                  type="text" 
                  defaultValue="Karthik"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Last Name</label>
                <Input 
                  type="text" 
                  defaultValue="Student"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Email</label>
              <Input 
                type="email" 
                defaultValue="karthik.student@college.edu"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Phone</label>
              <Input 
                type="tel" 
                defaultValue="+91 98765 43210"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Roll Number</label>
              <Input 
                type="text" 
                defaultValue="21UCS123"
                disabled
                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notification Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Email Notifications</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</div>
                  </div>
                </div>
                <Button
                  onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                  className={`px-4 py-2 rounded-xl ${notifications.email ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {notifications.email ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Push Notifications</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Get instant alerts on your device</div>
                  </div>
                </div>
                <Button
                  onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                  className={`px-4 py-2 rounded-xl ${notifications.push ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {notifications.push ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Sound Alerts</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Play sound for notifications</div>
                  </div>
                </div>
                <Button
                  onClick={() => setNotifications(prev => ({ ...prev, desktop: !prev.desktop }))}
                  className={`px-4 py-2 rounded-xl ${notifications.desktop ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {notifications.desktop ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Moon className="w-5 h-5" />
              <span>Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center space-x-3">
                {darkMode ? <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Dark Mode</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Toggle dark theme</div>
                </div>
              </div>
              <Button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                {darkMode ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="tamil">Tamil</option>
                <option value="telugu">Telugu</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Privacy & Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Change Password</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Update your account password</div>
                  </div>
                </div>
                <Button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  Change
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</div>
                  </div>
                </div>
                <Badge variant="secondary" className="px-3 py-1">
                  Not Enabled
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-white">Help Center</div>
                <div className="text-white/80 text-sm">Get support</div>
              </div>
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-white">Language</div>
                <div className="text-white/80 text-sm">{language}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <LogOut className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-white">Logout</div>
                <div className="text-white/80 text-sm">Sign out</div>
              </div>
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveSettings}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Save All Settings
          </Button>
        </div>
      </div>
    </StudentLayoutWithSearch>
  );
};

export default SettingsPage;
