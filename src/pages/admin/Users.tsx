import { useEffect, useState } from 'react';
import { useAuthStore, UserProfile } from '../../store/authStore';
import { Shield, User as UserIcon, CheckCircle, XCircle } from 'lucide-react';

const API = `/api/db/users`;

export default function Users() {
  const { profile } = useAuthStore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = (await res.json()) || [];
      setUsers(data.sort((a: UserProfile, b: UserProfile) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error fetching users:', error);
      // Show at least the current admin user
      if (profile) {
        setUsers([profile]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (uid: string, newRole: UserProfile['role']) => {
    if (profile?.role !== 'super_admin') {
      alert('Only Super Admins can change roles.');
      return;
    }
    setUpdating(uid);
    try {
      const user = users.find(u => (u.uid || u.id) === uid);
      if (!user) return;
      const res = await fetch(`${API}/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, role: newRole })
      });
      if (res.ok) {
        setUsers(users.map(u => (u.uid || u.id) === uid ? { ...u, role: newRole } : u));
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role.');
    }
    setUpdating(null);
  };

  const handleStatusToggle = async (uid: string, currentStatus: 'active' | 'inactive') => {
    if (profile?.role !== 'super_admin') return;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setUpdating(uid);
    try {
      const user = users.find(u => (u.uid || u.id) === uid);
      if (!user) return;
      const res = await fetch(`${API}/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, status: newStatus })
      });
      if (res.ok) {
        setUsers(users.map(u => (u.uid || u.id) === uid ? { ...u, status: newStatus } : u));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
    setUpdating(null);
  };

  const formatDate = (ts?: string) => {
    if (!ts) return 'Never';
    try { return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); } catch { return 'Never'; }
  };

  if (loading) return <div className="text-zinc-500 dark:text-zinc-400">Loading users...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Shield className="text-[#ff4d4d]" />
          User Management
        </h1>
      </div>

      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">No users found.</td>
                </tr>
              ) : users.map((user) => {
                const uid = user.uid || user.id;
                return (
                  <tr key={uid} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-amber-100 dark:bg-[#ff4d4d]/20 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-[#ff4d4d] dark:text-[#ff4d4d]" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-zinc-900 dark:text-white">{user.name || user.displayName || 'Admin'}</div>
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(uid, e.target.value as UserProfile['role'])}
                        disabled={updating === uid || profile?.role !== 'super_admin' || uid === (profile?.uid || profile?.id)}
                        className="text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md p-1"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {user.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                      {formatDate(user.lastLogin || user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleStatusToggle(uid, user.status)}
                        disabled={updating === uid || profile?.role !== 'super_admin' || uid === (profile?.uid || profile?.id)}
                        className="text-xs px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors disabled:opacity-40"
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
