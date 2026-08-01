'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function StoreInitializer() {
  const setClubs = useStore((state) => state.setClubs);
  const setProjects = useStore((state) => state.setProjects);

  useEffect(() => {
    // 1. Fetch Clubs
    fetch('/api/clubs')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mappedClubs = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            logo: c.logo_url || "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80",
            leaders: [],
            charterYear: c.charter_date ? new Date(c.charter_date).getFullYear().toString() : "2024",
            memberCount: c.member_count || 0,
            totalProjects: c.total_projects || 0,
            totalPoints: c.total_points || 0,
            zone: c.zone || "Zone 1",
            description: c.description || "Active Rotaract Club in District 3192.",
            email: c.email || ""
          }));
          setClubs(mappedClubs);
        }
      })
      .catch((err) => console.error("StoreInitializer: failed to fetch clubs:", err));

    // 2. Fetch Projects
    fetch('/api/activities?pageSize=100')
      .then((res) => res.json())
      .then((data) => {
        const activitiesList = data.data || [];
        if (Array.isArray(activitiesList)) {
          const mappedProjects = activitiesList.map((p: any) => ({
            id: p.id,
            coverImage: p.cover_image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
            title: p.title,
            clubId: p.club_id,
            clubName: p.organization_name || "Unknown Club",
            avenueOfService: (p.avenues && p.avenues[0]) || "Community Service",
            areaOfFocus: (p.focus_areas && p.focus_areas[0]) || "Education & Literacy",
            beneficiaries: p.beneficiaries || 0,
            volunteerHours: p.volunteer_hours || 0,
            impactScore: p.feature_activity ? 95 : 70,
            uploadDate: p.created_at || new Date().toISOString(),
            description: p.description,
            location: p.venue || "District 3192",
            zone: "Zone 1",
            contributions: p.activity_expenses || 0,
            volunteerCount: p.volunteers || 0,
          }));
          setProjects(mappedProjects);
        }
      })
      .catch((err) => console.error("StoreInitializer: failed to fetch projects:", err));
  }, [setClubs, setProjects]);

  return null;
}
