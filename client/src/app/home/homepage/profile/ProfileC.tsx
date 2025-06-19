import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';

interface UserProfile {
    fullName: string;
    username: string;
    email: string;
    phoneNumber: string;
    avatarUrl: string;
    role: string;
}

const EditProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = sessionStorage.getItem('accessToken');

    const [form, setForm] = useState<UserProfile>({
        fullName: '',
        username: '',
        email: '',
        phoneNumber: '',
        avatarUrl: '',
        role: '',
    });

    useEffect(() => {
        if (!id || !token) return;

        axios
            .get(`http://localhost:8000/api/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                if (res.data.status === 'success') {
                    const user = res.data.data;
                    setForm({
                        fullName: user.fullName || '',
                        username: user.username || '',
                        email: user.email || '',
                        phoneNumber: user.phoneNumber?.toString() || '',
                        avatarUrl: user.avatarUrl || '',
                        role: user.role || '',
                    });
                }
            })
            .catch(() => alert('Không thể lấy dữ liệu người dùng'));
    }, [id, token]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !token) return;

        try {
            await axios.put(
                `http://localhost:8000/api/users/${id}`,
                {
                    fullName: form.fullName,
                    username: form.username,
                    email: form.email,
                    phoneNumber: form.phoneNumber,
                    avatarUrl: form.avatarUrl,
                    role: form.role,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert('Cập nhật thành công!');
            navigate(`/home/profile/${id}`);
        } catch (err) {
            alert('Cập nhật thất bại!');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('accessToken');
        navigate('/auth/login');
    };

    return (
        <div className="max-w-3xl mx-auto mt-24 p-6 border bg-white rounded-lg shadow text-black">
            <h2 className="text-xl font-bold mb-6 text-center">Cập nhật thông tin</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center">
                    <img
                        src={form.avatarUrl || 'https://via.placeholder.com/100'}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full mx-auto mb-2 object-cover"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Họ tên</label>
                    <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded mt-1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Tên đăng nhập</label>
                    <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded mt-1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        disabled
                        className="w-full border px-3 py-2 rounded mt-1 bg-gray-100 text-gray-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Số điện thoại</label>
                    <input
                        type="text"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded mt-1"
                    />
                </div>

                <div className="text-center pt-4">
                    <button
                        type="submit"
                        className="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2 rounded"
                    >
                        Cập nhật
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="bg-[#B9205A] hover:bg-[#A3184D] text-white px-6 py-2 rounded-lg transition"
                    >
                        Đăng xuất
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;
