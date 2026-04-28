import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  DollarSign,
  Banknote,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  Copy,
  QrCode,
  Plus,
  History,
  Shield,
  Building2,
  Users,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';

// Types
type TransactionStatus = 'pending' | 'completed' | 'failed' | 'processing';
type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'payment' | 'investment';
type PaymentMethod = 'card' | 'bank' | 'paypal' | 'crypto';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  sender: string;
  receiver: string;
  senderId?: string;
  receiverId?: string;
  status: TransactionStatus;
  date: Date;
  description?: string;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
}

interface WalletBalance {
  total: number;
  available: number;
  pending: number;
  currency: string;
}

interface DealFunding {
  id: string;
  dealTitle: string;
  entrepreneurId: string;
  entrepreneurName: string;
  entrepreneurAvatar?: string;
  investorId: string;
  investorName: string;
  investorAvatar?: string;
  amount: number;
  status: 'pending' | 'funded' | 'completed';
  date: Date;
}

interface PaymentSectionProps {
  onBack?: () => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'funding' | 'methods'>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'deposit' | 'withdraw' | 'transfer' | 'fund'>('deposit');
  const [selectedDeal, setSelectedDeal] = useState<DealFunding | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Wallet Balance
  const [balance, setBalance] = useState<WalletBalance>({
    total: 25430.50,
    available: 23180.25,
    pending: 2250.25,
    currency: 'USD'
  });

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx_1',
      type: 'deposit',
      amount: 5000,
      sender: 'John Doe',
      receiver: 'My Wallet',
      status: 'completed',
      date: new Date('2024-03-20T10:30:00'),
      description: 'Bank Transfer Deposit',
      paymentMethod: 'bank',
      transactionId: 'BANK_TRX_123456'
    },
    {
      id: 'tx_2',
      type: 'investment',
      amount: 10000,
      sender: 'Michael Investor',
      receiver: 'Startup Nexus',
      status: 'completed',
      date: new Date('2024-03-19T14:20:00'),
      description: 'Seed Round Investment',
      paymentMethod: 'paypal',
      transactionId: 'PAYPAL_INV_789012'
    },
    {
      id: 'tx_3',
      type: 'transfer',
      amount: 2500,
      sender: 'Sarah Johnson',
      receiver: 'John Doe',
      status: 'pending',
      date: new Date('2024-03-18T09:15:00'),
      description: 'Consultation Fee',
      paymentMethod: 'card',
      transactionId: 'CARD_TRX_345678'
    },
    {
      id: 'tx_4',
      type: 'withdraw',
      amount: 1000,
      sender: 'My Wallet',
      receiver: 'Bank Account',
      status: 'processing',
      date: new Date('2024-03-17T16:45:00'),
      description: 'Withdrawal to Bank',
      paymentMethod: 'bank',
      transactionId: 'WTD_901234'
    },
    {
      id: 'tx_5',
      type: 'payment',
      amount: 350,
      sender: 'TechCorp',
      receiver: 'Freelancer',
      status: 'completed',
      date: new Date('2024-03-16T11:00:00'),
      description: 'Service Payment',
      paymentMethod: 'card',
      transactionId: 'PAY_567890'
    }
  ]);

  // Deal Funding Requests
  const [fundingDeals, setFundingDeals] = useState<DealFunding[]>([
    {
      id: 'deal_1',
      dealTitle: 'AI Startup Seed Round',
      entrepreneurId: 'ent_1',
      entrepreneurName: 'Alex Chen',
      entrepreneurAvatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg',
      investorId: 'inv_1',
      investorName: 'Sarah Williams',
      investorAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      amount: 50000,
      status: 'pending',
      date: new Date('2024-03-20')
    },
    {
      id: 'deal_2',
      dealTitle: 'Green Energy Project',
      entrepreneurId: 'ent_2',
      entrepreneurName: 'Maria Garcia',
      entrepreneurAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      investorId: 'inv_2',
      investorName: 'James Wilson',
      investorAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
      amount: 75000,
      status: 'pending',
      date: new Date('2024-03-19')
    }
  ]);

  const [formData, setFormData] = useState({
    amount: '',
    recipient: '',
    recipientEmail: '',
    description: '',
    paymentMethod: 'card' as PaymentMethod,
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    bankAccount: '',
    routingNumber: ''
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: balance.currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'processing':
        return <Badge variant="warning">Processing</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="text-green-600" size={20} />;
      case 'withdraw':
        return <ArrowUpRight className="text-red-600" size={20} />;
      case 'transfer':
        return <Send className="text-blue-600" size={20} />;
      case 'investment':
        return <DollarSign className="text-purple-600" size={20} />;
      default:
        return <RefreshCw className="text-gray-600" size={20} />;
    }
  };

  const handlePayment = () => {
    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) return;

    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: paymentType === 'deposit' ? 'deposit' : paymentType === 'withdraw' ? 'withdraw' : 'transfer',
      amount: amount,
      sender: paymentType === 'deposit' ? formData.recipient : 'My Wallet',
      receiver: paymentType === 'withdraw' ? formData.recipient : 'My Wallet',
      status: 'pending',
      date: new Date(),
      description: formData.description,
      paymentMethod: formData.paymentMethod,
      transactionId: `TRX_${Math.random().toString(36).substring(7).toUpperCase()}`
    };

    setTransactions([newTransaction, ...transactions]);

    if (paymentType === 'deposit') {
      setBalance({
        ...balance,
        total: balance.total + amount,
        available: balance.available + amount
      });
    } else if (paymentType === 'withdraw') {
      setBalance({
        ...balance,
        total: balance.total - amount,
        available: balance.available - amount
      });
    }

    setShowPaymentModal(false);
    setFormData({
      amount: '',
      recipient: '',
      recipientEmail: '',
      description: '',
      paymentMethod: 'card',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      bankAccount: '',
      routingNumber: ''
    });
  };

  const fundDeal = (deal: DealFunding) => {
    setFundingDeals(fundingDeals.map(d => 
      d.id === deal.id ? { ...d, status: 'funded' } : d
    ));

    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'investment',
      amount: deal.amount,
      sender: deal.investorName,
      receiver: deal.entrepreneurName,
      status: 'completed',
      date: new Date(),
      description: `Investment: ${deal.dealTitle}`,
      paymentMethod: 'bank',
      transactionId: `INV_${Math.random().toString(36).substring(7).toUpperCase()}`
    };

    setTransactions([newTransaction, ...transactions]);

    setBalance({
      ...balance,
      total: balance.total - deal.amount,
      available: balance.available - deal.amount
    });

    alert(`Successfully funded ${deal.dealTitle} with ${formatCurrency(deal.amount)}!`);
  };

  const recentTransactions = transactions.slice(0, 5);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Wallet, mobileLabel: 'Home' },
    { id: 'transactions', label: 'Transactions', icon: History, mobileLabel: 'History' },
    { id: 'funding', label: 'Deal Funding', icon: Users, mobileLabel: 'Funding' },
    { id: 'methods', label: 'Payment Methods', icon: CreditCard, mobileLabel: 'Methods' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold text-gray-900">Payments</h1>
              <p className="text-xs text-gray-500">Manage your finances</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        {/* Mobile Action Buttons */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 p-4 space-y-3">
            <Button
              onClick={() => {
                setPaymentType('deposit');
                setShowPaymentModal(true);
                setMobileMenuOpen(false);
              }}
              fullWidth
              className="bg-green-600 hover:bg-green-700"
            >
              <ArrowDownLeft size={18} className="mr-2" />
              Deposit
            </Button>
            <Button
              onClick={() => {
                setPaymentType('withdraw');
                setShowPaymentModal(true);
                setMobileMenuOpen(false);
              }}
              fullWidth
              variant="outline"
            >
              <ArrowUpRight size={18} className="mr-2" />
              Withdraw
            </Button>
            <Button
              onClick={() => {
                setPaymentType('transfer');
                setShowPaymentModal(true);
                setMobileMenuOpen(false);
              }}
              fullWidth
              variant="outline"
            >
              <Send size={18} className="mr-2" />
              Transfer
            </Button>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Desktop Header */}
        <div className="hidden lg:flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft size={20} />
                Back to Dashboard
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="text-blue-600" size={28} />
                Payment Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your wallet, transactions, and investments
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setPaymentType('deposit');
                setShowPaymentModal(true);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <ArrowDownLeft size={18} className="mr-2" />
              Deposit
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPaymentType('withdraw');
                setShowPaymentModal(true);
              }}
            >
              <ArrowUpRight size={18} className="mr-2" />
              Withdraw
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPaymentType('transfer');
                setShowPaymentModal(true);
              }}
            >
              <Send size={18} className="mr-2" />
              Transfer
            </Button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden mb-4">
          <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.mobileLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden lg:flex gap-2 border-b border-gray-200 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Wallet Balance Cards - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardBody className="p-4 sm:p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-blue-100 text-xs sm:text-sm">Total Balance</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">
                        {formatCurrency(balance.total)}
                      </p>
                      <p className="text-blue-100 text-xs mt-2">{balance.currency}</p>
                    </div>
                    <Wallet size={32} className="text-blue-300 opacity-75 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4 sm:p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-xs sm:text-sm">Available Balance</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(balance.available)}
                      </p>
                    </div>
                    <DollarSign size={28} className="text-green-500 opacity-50" />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4 sm:p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-xs sm:text-sm">Pending Balance</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600 mt-1">
                        {formatCurrency(balance.pending)}
                      </p>
                    </div>
                    <Clock size={28} className="text-yellow-400 opacity-50" />
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Quick Actions - Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Button
                onClick={() => {
                  setPaymentType('deposit');
                  setShowPaymentModal(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-sm sm:text-base"
              >
                <ArrowDownLeft size={16} className="mr-1 sm:mr-2" />
                Deposit
              </Button>
              <Button
                onClick={() => {
                  setPaymentType('transfer');
                  setShowPaymentModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
              >
                <Send size={16} className="mr-1 sm:mr-2" />
                Send
              </Button>
              <Button variant="outline" className="text-sm sm:text-base">
                <QrCode size={16} className="mr-1 sm:mr-2" />
                Scan
              </Button>
              <Button variant="outline" className="text-sm sm:text-base">
                <Download size={16} className="mr-1 sm:mr-2" />
                Export
              </Button>
            </div>

            {/* Recent Transactions - Responsive Table/Cards */}
            <Card>
              <CardHeader className="flex justify-between items-center p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900">Recent Transactions</h2>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View All
                </button>
              </CardHeader>
              <CardBody className="p-4 sm:p-6">
                <div className="space-y-3">
                  {recentTransactions.map(transaction => (
                    <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-gray-50 rounded-lg gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-full flex-shrink-0">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {transaction.description || transaction.type}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            {transaction.sender} → {transaction.receiver}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right flex sm:block justify-between items-center">
                        <p className={`font-semibold text-sm sm:text-base ${
                          transaction.type === 'deposit' || transaction.type === 'investment'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'investment' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <div className="sm:mt-1">
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </>
        )}

        {/* Transactions Tab - Responsive Table */}
        {activeTab === 'transactions' && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">Transaction History</h2>
            </CardHeader>
            <CardBody className="p-0 sm:p-6">
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Transaction ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Sender</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Receiver</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map(transaction => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-600 font-mono">
                          {transaction.transactionId?.slice(0, 12)}...
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.type)}
                            <span className="text-xs capitalize">{transaction.type}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-900 max-w-[150px] truncate">
                          {transaction.sender}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-900 max-w-[150px] truncate">
                          {transaction.receiver}
                        </td>
                        <td className={`px-4 py-3 text-xs font-semibold ${
                          transaction.type === 'deposit' || transaction.type === 'investment'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'investment' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(transaction.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - Visible on mobile */}
              <div className="md:hidden space-y-3 p-4">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="bg-white border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        <span className="font-medium text-gray-900 capitalize text-sm">
                          {transaction.type}
                        </span>
                      </div>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-mono">
                        ID: {transaction.transactionId?.slice(0, 12)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        Date: {new Date(transaction.date).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        From: {transaction.sender}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        To: {transaction.receiver}
                      </p>
                      <p className={`text-sm font-semibold ${
                        transaction.type === 'deposit' || transaction.type === 'investment'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'deposit' || transaction.type === 'investment' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Deal Funding Tab - Responsive */}
        {activeTab === 'funding' && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900">Investment Opportunities</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Fund promising startups and entrepreneurs</p>
              </CardHeader>
              <CardBody className="p-4 sm:p-6">
                <div className="space-y-4">
                  {fundingDeals.map(deal => (
                    <div key={deal.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex items-start gap-3 sm:gap-4 w-full sm:w-auto">
                          <Avatar src={deal.entrepreneurAvatar} alt={deal.entrepreneurName} size="lg" className="flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                              {deal.dealTitle}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                              Entrepreneur: {deal.entrepreneurName}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              Investor: {deal.investorName}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant={deal.status === 'pending' ? 'warning' : 'success'}>
                                {deal.status === 'pending' ? 'Pending Funding' : 'Funded'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(deal.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                          <p className="text-xl sm:text-2xl font-bold text-gray-900">
                            {formatCurrency(deal.amount)}
                          </p>
                          {deal.status === 'pending' && (
                            <Button
                              onClick={() => fundDeal(deal)}
                              className="mt-2 bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                            >
                              <DollarSign size={16} className="mr-1" />
                              Fund Deal
                            </Button>
                          )}
                          {deal.status === 'funded' && (
                            <Badge variant="success" className="mt-2">Investment Active</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Funding Stats - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardBody className="p-4 sm:p-6 text-center">
                  <Users size={28} className="mx-auto text-blue-500 mb-2" />
                  <p className="text-xl sm:text-2xl font-bold">{fundingDeals.length}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Available Deals</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="p-4 sm:p-6 text-center">
                  <DollarSign size={28} className="mx-auto text-green-500 mb-2" />
                  <p className="text-sm sm:text-base lg:text-xl font-bold truncate">
                    {formatCurrency(fundingDeals.reduce((sum, d) => sum + d.amount, 0))}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">Total Investment Pool</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="p-4 sm:p-6 text-center">
                  <Building2 size={28} className="mx-auto text-purple-500 mb-2" />
                  <p className="text-xl sm:text-2xl font-bold">
                    {fundingDeals.filter(d => d.status === 'funded').length}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">Funded Deals</p>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {/* Payment Methods Tab - Responsive Grid */}
        {activeTab === 'methods' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Saved Cards */}
            <Card>
              <CardHeader className="flex justify-between items-center p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900">Saved Cards</h2>
                <Button size="sm" variant="outline" className="text-xs sm:text-sm">
                  <Plus size={14} className="mr-1" />
                  Add
                </Button>
              </CardHeader>
              <CardBody className="p-4 sm:p-6 space-y-3">
                <div className="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <CreditCard size={28} className="text-blue-600 mb-2" />
                      <p className="font-mono text-sm sm:text-base">**** **** **** 4242</p>
                      <p className="text-xs text-gray-500 mt-1">Expires 12/26</p>
                    </div>
                    <Badge variant="success" className="text-xs">Default</Badge>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CreditCard size={28} className="text-purple-600 mb-2" />
                      <p className="font-mono text-sm sm:text-base">**** **** **** 5555</p>
                      <p className="text-xs text-gray-500 mt-1">Expires 08/25</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">Set Default</Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Bank Accounts */}
            <Card>
              <CardHeader className="flex justify-between items-center p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900">Bank Accounts</h2>
                <Button size="sm" variant="outline" className="text-xs sm:text-sm">
                  <Plus size={14} className="mr-1" />
                  Link
                </Button>
              </CardHeader>
              <CardBody className="p-4 sm:p-6 space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Building2 size={28} className="text-green-600" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">Chase Bank - ****6789</p>
                      <p className="text-xs text-gray-500">Checking Account</p>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Building2 size={28} className="text-blue-600" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">Bank of America - ****1234</p>
                      <p className="text-xs text-gray-500">Savings Account</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Connected Services */}
            <Card className="lg:col-span-2">
              <CardHeader className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900">Connected Services</h2>
              </CardHeader>
              <CardBody className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-sm sm:text-base">P</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base">PayPal</p>
                        <p className="text-xs text-gray-500">Connected</p>
                      </div>
                    </div>
                    <Badge variant="success" className="text-xs flex-shrink-0">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-bold text-sm sm:text-base">S</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base">Stripe</p>
                        <p className="text-xs text-gray-500">Connected</p>
                      </div>
                    </div>
                    <Badge variant="success" className="text-xs flex-shrink-0">Active</Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      {/* Payment Modal - Responsive */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-bold capitalize">
                {paymentType === 'deposit' ? 'Deposit Funds' : paymentType === 'withdraw' ? 'Withdraw Funds' : 'Send Money'}
              </h2>
              <button onClick={() => setShowPaymentModal(false)} className="hover:bg-gray-100 p-1 rounded">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Recipient */}
              {(paymentType === 'transfer' || paymentType === 'withdraw') && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {paymentType === 'transfer' ? 'Recipient Email' : 'Bank Account'}
                  </label>
                  <input
                    type={paymentType === 'transfer' ? 'email' : 'text'}
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder={paymentType === 'transfer' ? 'recipient@example.com' : 'Account Number'}
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="What's this for?"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="bank">Bank Account</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {/* Card Details */}
              {formData.paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Card Number</label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-mono text-sm sm:text-base"
                      placeholder="4242 4242 4242 4242"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={formData.cardExpiry}
                        onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CVC</label>
                      <input
                        type="text"
                        value={formData.cardCvv}
                        onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={handlePayment} fullWidth className="bg-blue-600 hover:bg-blue-700">
                  {paymentType === 'deposit' ? 'Deposit' : paymentType === 'withdraw' ? 'Withdraw' : 'Send'} {formData.amount && `$${formData.amount}`}
                </Button>
                <Button variant="outline" onClick={() => setShowPaymentModal(false)} fullWidth>
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                All transactions are secured with 256-bit SSL encryption
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};