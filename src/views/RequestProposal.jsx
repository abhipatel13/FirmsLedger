'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

export default function RequestProposal() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    } catch (error) {
      // Allow visitors to fill form, prompt to login on submit
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    company_name: '',
    contact_email: '',
    contact_phone: '',
    role: '',
    number_of_hires: 1,
    budget_range: '',
    timeline: '',
    country: '',
    state: '',
    city: '',
    remote_allowed: false,
    description: '',
  });

  const createLeadMutation = useMutation({
    mutationFn: (leadData) => api.entities.Lead.create(leadData),
    onSuccess: () => {
      toast.success('Proposal request submitted successfully! Agencies will contact you soon.');
      router.push(createPageUrl('Home'));
    },
    onError: () => {
      toast.error('Failed to submit request. Please try again.');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      // Prompt to login
      toast.error('Please sign in to submit a proposal request');
      api.auth.redirectToLogin(window.location.pathname);
      return;
    }

    if (!formData.role || !formData.timeline) {
      toast.error('Please fill in all required fields');
      return;
    }

    createLeadMutation.mutate({
      ...formData,
      user_id: user.id,
      status: 'Open',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Request Staffing Proposal</CardTitle>
            <p className="text-gray-600">
              Tell us about your hiring needs and we'll connect you with the best agencies
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email">Email *</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contact_phone">Phone Number</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Hiring Needs */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Hiring Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role/Position *</Label>
                    <Input
                      id="role"
                      placeholder="e.g., Software Engineer"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="number_of_hires">Number of Hires *</Label>
                    <Input
                      id="number_of_hires"
                      type="number"
                      min="1"
                      value={formData.number_of_hires}
                      onChange={(e) => setFormData({ ...formData, number_of_hires: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget_range">Budget Range *</Label>
                    <Select 
                      value={formData.budget_range} 
                      onValueChange={(value) => setFormData({ ...formData, budget_range: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Under $50k">Under $50k</SelectItem>
                        <SelectItem value="$50k-$100k">$50k-$100k</SelectItem>
                        <SelectItem value="$100k-$200k">$100k-$200k</SelectItem>
                        <SelectItem value="$200k-$500k">$200k-$500k</SelectItem>
                        <SelectItem value="$500k+">$500k+</SelectItem>
                        <SelectItem value="Not specified">Not specified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timeline">Timeline *</Label>
                    <Select 
                      value={formData.timeline} 
                      onValueChange={(value) => setFormData({ ...formData, timeline: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Immediate (< 1 month)">Immediate (&lt; 1 month)</SelectItem>
                        <SelectItem value="1-3 months">1-3 months</SelectItem>
                        <SelectItem value="3-6 months">3-6 months</SelectItem>
                        <SelectItem value="6+ months">6+ months</SelectItem>
                        <SelectItem value="Flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role, required skills, and any other important details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select 
                      value={formData.country} 
                      onValueChange={(value) => setFormData({ ...formData, country: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote_allowed"
                    checked={formData.remote_allowed}
                    onCheckedChange={(checked) => setFormData({ ...formData, remote_allowed: checked })}
                  />
                  <Label htmlFor="remote_allowed" className="cursor-pointer">
                    Remote work allowed
                  </Label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={createLeadMutation.isPending}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createLeadMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>

              {!user && (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                  You'll need to sign in to submit this request
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}