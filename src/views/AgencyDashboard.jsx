'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ReviewCard from '@/components/ReviewCard';
import { 
  LayoutDashboard, FileText, MessageSquare, 
  Star, TrendingUp, Mail 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AgencyDashboard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedAgency, setEditedAgency] = useState(null);
  const [responseText, setResponseText] = useState({});

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser.role !== 'admin' && currentUser.user_type !== 'agency_owner') {
        toast.error('Access denied. This page is for agency owners only.');
        window.location.href = createPageUrl('Home');
        return;
      }
      setUser(currentUser);
    } catch (error) {
      base44.auth.redirectToLogin(window.location.pathname);
    } finally {
      setLoading(false);
    }
  };

  // Get agency owned by current user
  const { data: myAgency, isLoading: agencyLoading } = useQuery({
    queryKey: ['my-agency', user?.id],
    queryFn: async () => {
      const agencies = await base44.entities.Agency.filter({ owner_user_id: user.id });
      return agencies[0];
    },
    enabled: !!user,
  });

  // Get leads for this agency
  const { data: leads = [] } = useQuery({
    queryKey: ['my-leads', myAgency?.id],
    queryFn: () => base44.entities.Lead.filter({ status: 'Open' }, '-created_date', 20),
    enabled: !!myAgency,
  });

  // Get reviews for this agency
  const { data: reviews = [] } = useQuery({
    queryKey: ['my-reviews', myAgency?.id],
    queryFn: () => base44.entities.Review.filter({ agency_id: myAgency.id }, '-created_date', 50),
    enabled: !!myAgency,
  });

  const updateAgencyMutation = useMutation({
    mutationFn: (data) => base44.entities.Agency.update(myAgency.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-agency']);
      toast.success('Agency profile updated');
      setEditMode(false);
    },
  });

  const respondToReviewMutation = useMutation({
    mutationFn: ({ reviewId, response }) => 
      base44.entities.Review.update(reviewId, { 
        agency_response: response,
        agency_response_date: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-reviews']);
      toast.success('Response posted');
      setResponseText({});
    },
  });

  const handleSaveProfile = () => {
    if (!editedAgency) return;
    updateAgencyMutation.mutate(editedAgency);
  };

  const handleRespondToReview = (reviewId) => {
    const response = responseText[reviewId];
    if (!response) return;
    respondToReviewMutation.mutate({ reviewId, response });
  };

  if (loading || agencyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (!myAgency) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 mb-4">
              You don't have an agency profile yet. Contact an admin to claim your agency.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    avgRating: myAgency.avg_rating || 0,
    totalReviews: reviews.length,
    pendingReviews: reviews.filter(r => !r.approved).length,
    openLeads: leads.length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agency Dashboard</h1>
          <p className="text-gray-600">{myAgency.name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold">{stats.totalReviews}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold">{stats.pendingReviews}</p>
                </div>
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Open Leads</p>
                  <p className="text-2xl font-bold">{stats.openLeads}</p>
                </div>
                <Mail className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Agency Profile</CardTitle>
                  {!editMode ? (
                    <Button onClick={() => {
                      setEditMode(true);
                      setEditedAgency({ ...myAgency });
                    }}>
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile}>Save</Button>
                      <Button variant="outline" onClick={() => setEditMode(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!editMode ? (
                  <>
                    <div>
                      <Label>Description</Label>
                      <p className="text-gray-700 mt-1">{myAgency.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Website</Label>
                        <p className="text-gray-700 mt-1">{myAgency.website || 'Not set'}</p>
                      </div>
                      <div>
                        <Label>Team Size</Label>
                        <p className="text-gray-700 mt-1">{myAgency.team_size || 'Not set'}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={editedAgency.description}
                        onChange={(e) => setEditedAgency({ ...editedAgency, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Website</Label>
                        <Input
                          value={editedAgency.website || ''}
                          onChange={(e) => setEditedAgency({ ...editedAgency, website: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Founded Year</Label>
                        <Input
                          type="number"
                          value={editedAgency.founded_year || ''}
                          onChange={(e) => setEditedAgency({ ...editedAgency, founded_year: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-gray-500">No reviews yet</p>
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <ReviewCard review={review} />
                      {!review.agency_response && (
                        <div className="mt-4 space-y-3">
                          <Label>Respond to this review</Label>
                          <Textarea
                            placeholder="Write your response..."
                            value={responseText[review.id] || ''}
                            onChange={(e) => setResponseText({ ...responseText, [review.id]: e.target.value })}
                            rows={3}
                          />
                          <Button onClick={() => handleRespondToReview(review.id)}>
                            Post Response
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <div className="space-y-4">
              {leads.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-gray-500">No leads yet</p>
                  </CardContent>
                </Card>
              ) : (
                leads.map((lead) => (
                  <Card key={lead.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{lead.role}</h3>
                          <p className="text-sm text-gray-500">
                            {format(new Date(lead.created_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge>{lead.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-600">Company:</span>
                          <span className="ml-2 font-medium">{lead.company_name || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Hires:</span>
                          <span className="ml-2 font-medium">{lead.number_of_hires}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Budget:</span>
                          <span className="ml-2 font-medium">{lead.budget_range}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Timeline:</span>
                          <span className="ml-2 font-medium">{lead.timeline}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">{lead.description}</p>
                      {lead.contact_email && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-gray-600">Contact: {lead.contact_email}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}