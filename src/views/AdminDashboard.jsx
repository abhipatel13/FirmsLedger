'use client';

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, XCircle, Building2, MessageSquare, 
  Users, Star 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ReviewCard from '@/components/ReviewCard';
import AgencyCard from '@/components/AgencyCard';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser.role !== 'admin') {
        toast.error('Access denied. Admin only.');
        window.location.href = '/';
        return;
      }
      setUser(currentUser);
    } catch (error) {
      base44.auth.redirectToLogin(window.location.pathname);
    } finally {
      setLoading(false);
    }
  };

  // Queries
  const { data: pendingAgencies = [] } = useQuery({
    queryKey: ['pending-agencies'],
    queryFn: () => base44.entities.Agency.filter({ approved: false }, '-created_date'),
    enabled: !!user,
  });

  const { data: pendingReviews = [] } = useQuery({
    queryKey: ['pending-reviews'],
    queryFn: () => base44.entities.Review.filter({ approved: false }, '-created_date'),
    enabled: !!user,
  });

  const { data: allAgencies = [] } = useQuery({
    queryKey: ['all-agencies'],
    queryFn: () => base44.entities.Agency.list('-created_date'),
    enabled: !!user,
  });

  const { data: allReviews = [] } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date'),
    enabled: !!user,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list(),
    enabled: !!user,
  });

  // Mutations
  const approveAgencyMutation = useMutation({
    mutationFn: (agencyId) => base44.entities.Agency.update(agencyId, { approved: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-agencies']);
      queryClient.invalidateQueries(['all-agencies']);
      toast.success('Agency approved');
    },
  });

  const rejectAgencyMutation = useMutation({
    mutationFn: (agencyId) => base44.entities.Agency.delete(agencyId),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-agencies']);
      toast.success('Agency rejected');
    },
  });

  const approveReviewMutation = useMutation({
    mutationFn: ({ reviewId, agencyId }) => {
      // Update review approval
      return base44.entities.Review.update(reviewId, { approved: true, verified: true });
    },
    onSuccess: async (_, { agencyId }) => {
      // Recalculate agency rating
      const approvedReviews = await base44.entities.Review.filter({ 
        agency_id: agencyId, 
        approved: true 
      });
      const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating_overall, 0) / approvedReviews.length;
      await base44.entities.Agency.update(agencyId, { 
        avg_rating: avgRating,
        review_count: approvedReviews.length
      });
      
      queryClient.invalidateQueries(['pending-reviews']);
      queryClient.invalidateQueries(['all-reviews']);
      queryClient.invalidateQueries(['all-agencies']);
      toast.success('Review approved');
    },
  });

  const rejectReviewMutation = useMutation({
    mutationFn: (reviewId) => base44.entities.Review.delete(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-reviews']);
      toast.success('Review rejected');
    },
  });

  const toggleVerifiedMutation = useMutation({
    mutationFn: ({ agencyId, verified }) => 
      base44.entities.Agency.update(agencyId, { verified: !verified }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-agencies']);
      toast.success('Verified status updated');
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ agencyId, featured }) => 
      base44.entities.Agency.update(agencyId, { featured: !featured }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-agencies']);
      toast.success('Featured status updated');
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading admin dashboard...</p>
      </div>
    );
  }

  const stats = {
    totalAgencies: allAgencies.length,
    pendingAgencies: pendingAgencies.length,
    totalReviews: allReviews.length,
    pendingReviews: pendingReviews.length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage agencies, reviews, and platform content</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Agencies</p>
                  <p className="text-2xl font-bold">{stats.totalAgencies}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Agencies</p>
                  <p className="text-2xl font-bold">{stats.pendingAgencies}</p>
                </div>
                <Building2 className="w-8 h-8 text-orange-600" />
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
                <MessageSquare className="w-8 h-8 text-green-600" />
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
                <MessageSquare className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="agencies" className="space-y-6">
          <TabsList>
            <TabsTrigger value="agencies">
              Agencies ({pendingAgencies.length} pending)
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({pendingReviews.length} pending)
            </TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* Agencies Tab */}
          <TabsContent value="agencies">
            {pendingAgencies.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Pending Approval</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingAgencies.map((agency) => (
                    <div key={agency.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{agency.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{agency.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {format(new Date(agency.created_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => approveAgencyMutation.mutate(agency.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectAgencyMutation.mutate(agency.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>All Agencies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allAgencies.filter(a => a.approved).map((agency) => (
                    <div key={agency.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{agency.name}</h3>
                          {agency.verified && <Badge>Verified</Badge>}
                          {agency.featured && <Badge variant="secondary">Featured</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">
                          {agency.avg_rating?.toFixed(1)} ★ ({agency.review_count} reviews)
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleVerifiedMutation.mutate({ 
                            agencyId: agency.id, 
                            verified: agency.verified 
                          })}
                        >
                          {agency.verified ? 'Unverify' : 'Verify'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFeaturedMutation.mutate({ 
                            agencyId: agency.id, 
                            featured: agency.featured 
                          })}
                        >
                          {agency.featured ? 'Unfeature' : 'Feature'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            {pendingReviews.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Pending Approval</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {pendingReviews.map((review) => {
                    const agency = allAgencies.find(a => a.id === review.agency_id);
                    return (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="mb-4">
                          <Badge variant="outline">{agency?.name}</Badge>
                        </div>
                        <ReviewCard review={review} />
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => approveReviewMutation.mutate({ 
                              reviewId: review.id,
                              agencyId: review.agency_id
                            })}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve & Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectReviewMutation.mutate(review.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>All Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {allReviews.filter(r => r.approved).map((review) => {
                  const agency = allAgencies.find(a => a.id === review.agency_id);
                  return (
                    <div key={review.id} className="border rounded-lg p-4">
                      <Badge variant="outline" className="mb-3">{agency?.name}</Badge>
                      <ReviewCard review={review} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="p-4 border rounded-lg">
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}