import { useCallback, useEffect, useState } from 'react';
import {
  CREATOR_PROFILE,
  EARNINGS_SUMMARY,
  INITIAL_AFFILIATE_LINKS,
  INITIAL_NOTIFICATIONS,
  INITIAL_WITHDRAWALS,
  formatINR,
} from './data/affiliateData';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { BottomNav } from './components/layout/BottomNav';
import { ToastStack } from './components/ui/Toast';
import { DashboardSkeleton } from './components/ui/Skeletons';
import { NotificationsDrawer } from './components/modals/NotificationsDrawer';
import { WithdrawModal } from './components/modals/WithdrawModal';
import { EmptyStatesShowcaseModal } from './components/modals/EmptyStatesShowcaseModal';
import { DashboardHome } from './pages/DashboardHome';
import { LinksPage } from './pages/LinksPage';
import { OrdersPage } from './pages/OrdersPage';
import { EarningsPage } from './pages/EarningsPage';
import { MarketingAssetsPage } from './pages/MarketingAssetsPage';
import { CouponsPage } from './pages/CouponsPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobilePreview, setMobilePreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarQuery, setSidebarQuery] = useState('');

  const [creator, setCreator] = useState(CREATOR_PROFILE);
  const [links, setLinks] = useState(INITIAL_AFFILIATE_LINKS);
  const [earningsSummary, setEarningsSummary] = useState(EARNINGS_SUMMARY);
  const [withdrawals, setWithdrawals] = useState(INITIAL_WITHDRAWALS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const [notifOpen, setNotifOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [emptyPreviewOpen, setEmptyPreviewOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 380);
    return () => clearTimeout(timer);
  }, []);

  const showToast = useCallback((message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 2600);
  }, []);

  const handleCopy = useCallback(
    async (text, key, toastMessage = 'Copied to clipboard!') => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        }
      } catch {
        // Clipboard permission unavailable in non-HTTPS contexts; still provide UI feedback
      }
      setCopiedId(key);
      showToast(toastMessage);
      setTimeout(() => {
        setCopiedId((prev) => (prev === key ? null : prev));
      }, 1800);
    },
    [showToast]
  );

  const handleNavigate = useCallback((tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleReplaySkeleton = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 750);
  };

  const handlePromoteCampaign = (campaign) => {
    const trackedUrl = `${campaign.url}?ref=${creator.creatorId}`;
    handleCopy(trackedUrl, `camp-${campaign.id}`, `Copied ${campaign.title} link (${campaign.commissionRate})!`);
  };

  const handleAddLink = (newLink) => {
    setLinks((prev) => [newLink, ...prev]);
  };

  const handleWithdrawSubmit = ({ amount, method }) => {
    setEarningsSummary((prev) => ({
      ...prev,
      availableBalance: Math.max(0, prev.availableBalance - amount),
    }));
    setWithdrawals((prev) => [
      {
        id: `wd-${Date.now()}`,
        amount,
        date: '25 Nov 2026',
        method,
        status: 'Pending',
      },
      ...prev,
    ]);
    setNotifications((prev) => [
      {
        id: `ntf-${Date.now()}`,
        type: 'Withdrawal Approved',
        title: `Withdrawal Requested • ${formatINR(amount)}`,
        description: `Payout via ${method} queued for settlement.`,
        time: 'Just now',
        unread: true,
      },
      ...prev,
    ]);
    showToast(`Withdrawal request for ${formatINR(amount)} submitted!`);
  };

  const handleUpdatePayment = (nextPayment) => {
    setCreator((prev) => ({
      ...prev,
      paymentDetails: {
        ...prev.paymentDetails,
        ...nextPayment,
      },
    }));
    showToast('Payment details updated!');
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const renderPage = () => {
    if (isLoading) return <DashboardSkeleton />;

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardHome
            creator={creator}
            copiedId={copiedId}
            onCopy={handleCopy}
            onNavigate={handleNavigate}
            onOpenWithdraw={() => setWithdrawOpen(true)}
            onPromoteCampaign={handlePromoteCampaign}
          />
        );
      case 'links':
        return (
          <LinksPage
            links={links}
            creatorId={creator.creatorId}
            copiedId={copiedId}
            onCopy={handleCopy}
            onAddLink={handleAddLink}
            onClearLinks={() => setLinks([])}
            onRestoreLinks={() => setLinks(INITIAL_AFFILIATE_LINKS)}
            showToast={showToast}
          />
        );
      case 'orders':
        return <OrdersPage />;
      case 'earnings':
        return (
          <EarningsPage
            summary={earningsSummary}
            withdrawals={withdrawals}
            onOpenWithdraw={() => setWithdrawOpen(true)}
            onNavigate={handleNavigate}
          />
        );
      case 'assets':
        return <MarketingAssetsPage copiedId={copiedId} onCopy={handleCopy} showToast={showToast} />;
      case 'coupons':
        return <CouponsPage copiedId={copiedId} onCopy={handleCopy} />;
      case 'profile':
      case 'levels':
        return (
          <ProfilePage
            creator={creator}
            onUpdatePayment={handleUpdatePayment}
            copiedId={copiedId}
            onCopy={handleCopy}
            onNavigate={handleNavigate}
            onOpenEmptyPreview={() => setEmptyPreviewOpen(true)}
            focusSection={activeTab}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`app-shell ${mobilePreview ? 'is-mobile-preview' : ''}`}>
      <Sidebar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        unreadCount={unreadCount}
        onOpenNotifications={() => setNotifOpen(true)}
        onOpenEmptyPreview={() => setEmptyPreviewOpen(true)}
        sidebarQuery={sidebarQuery}
        onSidebarQueryChange={setSidebarQuery}
      />

      <div className="main-workspace">
        <TopHeader
          activeTab={activeTab}
          unreadCount={unreadCount}
          onOpenNotifications={() => setNotifOpen(true)}
          onNavigate={handleNavigate}
          mobilePreview={mobilePreview}
          onToggleMobilePreview={() => setMobilePreview((v) => !v)}
          onReplaySkeleton={handleReplaySkeleton}
          creator={creator}
        />

        <main className="page-container">{renderPage()}</main>

        <BottomNav activeTab={activeTab} onNavigate={handleNavigate} />
      </div>

      <NotificationsDrawer
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}
        onMarkOneRead={(id) =>
          setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))
        }
        onClearAll={() => setNotifications([])}
        onRestoreDemo={() => setNotifications(INITIAL_NOTIFICATIONS)}
      />

      <WithdrawModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        availableBalance={earningsSummary.availableBalance}
        minWithdrawal={earningsSummary.minWithdrawal}
        paymentDetails={creator.paymentDetails}
        onSubmitWithdraw={handleWithdrawSubmit}
      />

      <EmptyStatesShowcaseModal
        isOpen={emptyPreviewOpen}
        onClose={() => setEmptyPreviewOpen(false)}
        onNavigate={handleNavigate}
      />

      <ToastStack toasts={toasts} />
    </div>
  );
}
