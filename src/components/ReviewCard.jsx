import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, User } from 'lucide-react';
import RatingDisplay from './RatingDisplay';
import { format } from 'date-fns';

export default function ReviewCard({ review, showAgencyName: _showAgencyName = false }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {review.company_name || 'Anonymous'}
                  </span>
                  {review.verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {format(new Date(review.created_date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            
            <RatingDisplay rating={review.rating_overall} size="sm" />
            
            <h4 className="font-semibold text-gray-900 mt-3">{review.title}</h4>
            <p className="text-gray-600 mt-2">{review.body}</p>
            
            {review.role_hired && (
              <div className="mt-3 text-sm text-gray-500">
                <span className="font-medium">Role Hired:</span> {review.role_hired}
                {review.work_duration && (
                  <span className="ml-3">
                    <span className="font-medium">Duration:</span> {review.work_duration}
                  </span>
                )}
              </div>
            )}
            
            {/* Rating Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t">
              <div>
                <p className="text-xs text-gray-500">Quality</p>
                <RatingDisplay rating={review.rating_quality} size="sm" showNumber={false} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Communication</p>
                <RatingDisplay rating={review.rating_communication} size="sm" showNumber={false} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Value</p>
                <RatingDisplay rating={review.rating_value} size="sm" showNumber={false} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Timeliness</p>
                <RatingDisplay rating={review.rating_timeliness} size="sm" showNumber={false} />
              </div>
            </div>
            
            {/* Agency Response */}
            {review.agency_response && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-blue-900 mb-1">Agency Response</p>
                <p className="text-sm text-blue-800">{review.agency_response}</p>
                {review.agency_response_date && (
                  <p className="text-xs text-blue-600 mt-2">
                    {format(new Date(review.agency_response_date), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}