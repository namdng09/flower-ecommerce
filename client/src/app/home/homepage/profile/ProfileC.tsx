import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';

interface UserProfile {
    _id: string;
    fullName: string;
    username: string;
    email: string;
    phoneNumber: string;
    role: string;
    avatarUrl: string;
    coverUrl: string;
    addresses: string[];
    createdAt: string;
    updatedAt: string;
    nickname?: string;
    dob?: string;
}

const Profile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                setError('Missing token');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:8000/api/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.status === 'success') {
                    setProfile(response.data.data);
                } else {
                    setError('User not found');
                }
            } catch (err) {
                setError('Failed to fetch profile');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProfile();
    }, [id]);

    const handleLogout = () => {
        sessionStorage.removeItem('accessToken');
        navigate('/auth/login');
    };

    if (loading) return <div className="text-center mt-40">Loading profile...</div>;
    if (error) return <div className="text-center mt-40 text-red-500">Error: {error}</div>;
    if (!profile) return <div className="text-center mt-40">No profile data</div>;

    return (
        <div className="max-w-xl mx-auto mt-52 p-6 border border-gray-300 rounded-lg shadow-sm text-black">
            <div className="flex flex-col items-center mb-6">
                <img
                    src={profile.avatarUrl || 'https://i.pravatar.cc/100'}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover mb-3"
                />
                <h2 className="text-xl font-semibold">{profile.fullName}</h2>
                <p className="text-gray-500 text-sm flex items-center">
                    @{profile.username}
                    <span className="ml-2 text-blue-500 cursor-pointer hover:underline">✎</span>
                </p>
            </div>

            <div className="space-y-4 text-left">
                <div className="flex justify-between">
                    <p className="font-semibold">Username:</p>
                    <p className="text-gray-700 flex items-center">{profile.username} <span className="ml-2 text-blue-500 cursor-pointer">✎</span></p>
                </div>
                <div className="flex justify-between">
                    <p className="font-semibold">Email:</p>
                    <p className="text-gray-700 flex items-center">{profile.email} <span className="ml-2 text-blue-500 cursor-pointer">✎</span></p>
                </div>
                <div className="flex justify-between">
                    <p className="font-semibold">Address:</p>
                    <p className="text-gray-700 flex items-center">{profile.addresses?.[0] || 'Chưa có'} <span className="ml-2 text-blue-500 cursor-pointer">✎</span></p>
                </div>
            </div>

            <div className="mt-6 text-center">
                <button
                    onClick={handleLogout}
                    className="bg-[#B9205A] hover:bg-[#A3184D] text-white px-6 py-2 rounded-lg transition"
                >
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default Profile;
