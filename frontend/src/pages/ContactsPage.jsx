import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Users,
  Search,
  SlidersHorizontal,
  Mail,
  Copy,
  Check,
  Eye,
  Send,
  Building2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';
import { contactsService, outreachService } from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import AlertBanner from '../components/AlertBanner';
import Modal from '../components/Modal';

export default function ContactsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [contacts, setContacts] = useState([]);
  const [totalInPdf, setTotalInPdf] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [startSno, setStartSno] = useState(searchParams.get('start') || '');
  const [endSno, setEndSno] = useState(searchParams.get('end') || '');

  // Pagination for large list
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Selected contact modal for quick preview
  const [selectedContact, setSelectedContact] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [contactPreview, setContactPreview] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await contactsService.getContacts({
        start: startSno ? Number(startSno) : undefined,
        end: endSno ? Number(endSno) : undefined,
        search: searchTerm || undefined,
      });

      setContacts(res.contacts || []);
      setTotalInPdf(res.total_in_pdf || 0);
      setFilteredCount(res.count || 0);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchContacts();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStartSno('');
    setEndSno('');
    contactsService
      .getContacts({})
      .then((res) => {
        setContacts(res.contacts || []);
        setFilteredCount(res.count || 0);
        setCurrentPage(1);
      })
      .catch((err) => setError(err.message));
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleInspectContact = async (contact) => {
    setSelectedContact(contact);
    setPreviewLoading(true);
    setContactPreview(null);

    try {
      const res = await outreachService.getPreview({
        start: contact.sno,
        end: contact.sno,
      });
      if (res.previews && res.previews.length > 0) {
        setContactPreview(res.previews[0]);
      }
    } catch (err) {
      console.warn('Could not fetch single preview:', err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Pagination slice
  const totalPages = Math.ceil(contacts.length / pageSize) || 1;
  const paginatedContacts = contacts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              HR Contacts Directory
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-medium">
              {totalInPdf.toLocaleString()} in Source PDF
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Cleanly extracted from <code>contactInfo.pdf</code> with multi-line email normalization, recruiter title mapping, and instant search.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {startSno && endSno && (
            <Link
              to={`/campaign?start=${startSno}&end=${endSno}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Launch On Filter ({Number(endSno) - Number(startSno) + 1})</span>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <AlertBanner
          type="error"
          title="Failed to load contacts"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3 items-center">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by recruiter name, target company, title, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50/50"
            />
          </div>

          {/* Range Inputs */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">SNo:</span>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={startSno}
                onChange={(e) => setStartSno(e.target.value)}
                className="w-16 px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-center focus:outline-hidden"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="number"
                min="1"
                placeholder="100"
                value={endSno}
                onChange={(e) => setEndSno(e.target.value)}
                className="w-16 px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-center focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              Apply Filter
            </button>

            {(searchTerm || startSno || endSno) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredCount.toLocaleString()}</strong> matching contacts
          </span>
          <span className="font-mono text-[11px]">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : paginatedContacts.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Users}
              title="No contacts found"
              description="No contacts matched your search query. Try broadening your keywords or range."
              action={
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  Clear All Filters
                </button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">SNo</th>
                  <th className="py-3 px-4">Contact Name</th>
                  <th className="py-3 px-4">Company & Title</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedContacts.map((contact) => (
                  <tr
                    key={contact.sno}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-semibold">
                      #{contact.sno}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {contact.name || 'Hiring Team'}
                      </div>
                      <div className="text-[11px] text-slate-400">Verified HR Profile</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[220px]">{contact.company || '—'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[220px]">{contact.title || 'Recruiter'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 select-all">
                          {contact.email}
                        </span>
                        <button
                          onClick={() => handleCopyEmail(contact.email)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Copy email to clipboard"
                        >
                          {copiedEmail === contact.email ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleInspectContact(contact)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview Draft</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {contacts.length > pageSize && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, contacts.length)} of {contacts.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Contact & Preview Modal */}
      <Modal
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        title={`Contact #${selectedContact?.sno}: ${selectedContact?.name || 'Recruiter'}`}
        maxWidth="max-w-2xl"
      >
        {selectedContact && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Company</span>
                <span className="font-semibold text-slate-800">{selectedContact.company}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Role / Title</span>
                <span className="font-semibold text-slate-800">{selectedContact.title}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5">Email Address</span>
                <span className="font-mono font-medium text-slate-900 select-all">
                  {selectedContact.email}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Rendered Outreach Email Preview
                </h4>
                {contactPreview?.already_sent && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium border border-amber-200">
                    Already Sent Previously
                  </span>
                )}
              </div>

              {previewLoading ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200 animate-pulse">
                  Rendering personalized template with candidate profile...
                </div>
              ) : contactPreview ? (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-900 text-white rounded-xl text-xs font-mono">
                    <span className="text-slate-400">Subject: </span>
                    {contactPreview.subject}
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-sans whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {contactPreview.body}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  Preview not available.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedContact(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <Link
                to={`/campaign?start=${selectedContact.sno}&end=${selectedContact.sno}`}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open in Campaign</span>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

