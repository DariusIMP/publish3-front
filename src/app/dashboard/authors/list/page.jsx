'use client';

import { useState, useEffect } from 'react';

import { getAuthorsList } from 'src/actions/authors';
import { DashboardContent } from 'src/layouts/dashboard';
import { AuthorCardsView } from 'src/sections/authors/view/author-cards-view';

// ----------------------------------------------------------------------

export default function Page() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setLoading(true);
        // Fetch authors from backend - now includes publications_count
        // getAuthorsList() returns the authors array directly
        const authorsData = await getAuthorsList();
        
        setAuthors(authorsData);
      } catch (err) {
        setError('Failed to load authors');
        console.error('Error fetching authors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  return (
    <DashboardContent>
      <AuthorCardsView authors={authors} loading={loading} error={error} />
    </DashboardContent>
  );
}
