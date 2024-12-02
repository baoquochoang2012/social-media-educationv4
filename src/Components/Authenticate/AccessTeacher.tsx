import React, { useState, useContext, useEffect } from "react";
import { db } from "../firebase/firebase";
import { AuthContext } from "../AppContext/AppContext";
import {
    collection,
    query,
    where,
    onSnapshot,
    limit,
    startAfter,
    orderBy,
    doc,
    updateDoc,
    getDoc,
    getDocs,
    endBefore,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { getFunctions, httpsCallable } from "firebase/functions"; // Import Firebase Functions

const AccessTeacher: React.FC = () => {
    const authContext = useContext(AuthContext);
    if (!authContext) {
        return null; // Hoặc có thể hiện trạng thái loading
    }

    const { userData } = authContext;
    const [list, setList] = useState<any[]>([]);
    const [lastVisible, setLastVisible] = useState<any>(null);
    const [firstVisible, setFirstVisible] = useState<any>(null);
    const [pageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>(""); // Add this state
    const fetchUsers = async (direction?: string) => {
        setLoading(true);
    
        if (searchTerm) {
            // Perform two queries: one for the name and one for the email
            const nameQuery = query(
                collection(db, "users"),
                where("name", ">=", searchTerm),
                where("name", "<=", searchTerm + "\uf8ff"),
                orderBy("name"),
                limit(pageSize)
            );
    
            const emailQuery = query(
                collection(db, "users"),
                where("email", ">=", searchTerm),
                where("email", "<=", searchTerm + "\uf8ff"),
                orderBy("email"),
                limit(pageSize)
            );
    
            // Fetch both results and manually filter out the current user's UID
            const [nameSnapshot, emailSnapshot] = await Promise.all([
                getDocs(nameQuery),
                getDocs(emailQuery),
            ]);
    
            const filteredNameResults = nameSnapshot.docs.filter(
                (doc) => doc.data().uid !== userData.uid
            );
            const filteredEmailResults = emailSnapshot.docs.filter(
                (doc) => doc.data().uid !== userData.uid
            );
    
            const nameUsers = filteredNameResults.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
    
            const emailUsers = filteredEmailResults.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
    
            // Combine both name and email query results, remove duplicates
            const combinedUsers = [...nameUsers, ...emailUsers].reduce(
                (acc: any[], user: any) => {
                    if (!acc.find((u) => u.id === user.id)) {
                        acc.push(user); // Avoid duplicates
                    }
                    return acc;
                },
                []
            );
    
            setList(combinedUsers);
            setFirstVisible(
                nameSnapshot.docs[0] || emailSnapshot.docs[0]
            );
            setLastVisible(
                nameSnapshot.docs[nameSnapshot.docs.length - 1] ||
                    emailSnapshot.docs[emailSnapshot.docs.length - 1]
            );
            setLoading(false);
    
            return; // Skip the rest of the code if searching
        }
    
        // Handle pagination logic here if search is not active
        let q = query(
            collection(db, "users"),
            where("uid","!=",userData.uid),
            orderBy("uid"),
            limit(pageSize)
        );
    
        if (direction === "next" && lastVisible) {
            q = query(
                collection(db, "users"),
                where("uid","!=",userData.uid),
                orderBy("uid"),
                startAfter(lastVisible),
                limit(pageSize)
            );
        } else if (direction === "prev" && firstVisible) {
            // Implement previous page logic if needed
            q = query(
                collection(db, "users"),
                where("uid","!=",userData.uid),
                orderBy("uid"),
                endBefore(firstVisible),
                limit(pageSize)
            );
        }
    
        // Fetch data with real-time updates (onSnapshot)
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const fetchedUsers = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
    
                setFirstVisible(snapshot.docs[0]);
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
                setList(fetchedUsers);
            }
            setLoading(false);
        });
    
        return () => unsubscribe();
    };
    

    const sendMail = async (to: string, subject: string, text: string) => {
        try {
            const response = await fetch("http://localhost:3000/sendMail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ to, subject, text }),
            });

            if (!response.ok) {
                throw new Error("Error sending email: " + response.statusText);
            }

            const result = await response.json();
            console.log('result', result);
            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Error sending email:", error);
        }
    };

    const approveProfile = async (userId: string) => {
        try {
            const userDocRef = doc(db, "users", userId);
            await updateDoc(userDocRef, { role: "teacher" });
            fetchUsers();

            // Send email notification
            const userDoc = await getDoc(userDocRef); // Sử dụng getDoc để lấy dữ liệu
            const userEmail = userDoc.data()?.email; // Lấy email
            await sendMail(
                userEmail,
                "[Social Media] - Profile Approved",
                "Your profile has been approved as a teacher."
            );

            Swal.fire({
                title: "Duyệt thành công",
                icon: "success",
                toast: true,
                position: "top-end",
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    const revokeTeacher = async (userId: string) => {
        try {
            const userDocRef = doc(db, "users", userId);
            await updateDoc(userDocRef, { role: "user" });
            fetchUsers();

            // Send email notification
            const userDoc = await getDoc(userDocRef); // Sử dụng getDoc để lấy dữ liệu
            const userEmail = userDoc.data()?.email; // Lấy email
            await sendMail(
                userEmail,
                "[Social Media] - Profile Revoked",
                "Your profile has been revoked from being a teacher."
            );

            Swal.fire({
                title: "Thu hồi thành công",
                icon: "success",
                toast: true,
                position: "top-end",
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">

            <form onSubmit={(e) => {
                e.preventDefault();
                fetchUsers(); // Trigger fetch on search
            }}>
                <label htmlFor="search" className="mb-2 text-sm font-medium text-gray-900 sr-only white:text-white">Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 white:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>
                    <input
                        type="search"
                        id="search"
                        value={searchTerm} // Bind the input to searchTerm state
                        onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm on input change
                        className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 white:bg-gray-700 white:border-gray-600 white:placeholder-gray-400 white:text-white white:focus:ring-blue-500 white:focus:border-blue-500"
                        placeholder="Search by name"
                    />
                    <button
                        type="submit"
                        className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 white:bg-blue-600 white:hover:bg-blue-700 white:focus:ring-blue-800"
                    >
                        Search
                    </button>
                </div>
            </form>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500 white:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 white:bg-gray-700 white:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Email</th>
                        <th scope="col" className="px-6 py-3">Role</th>
                        <th scope="col" className="px-6 py-3">Profile</th>
                        <th scope="col" className="px-6 py-3">Approve/Revoke</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((user) => (
                        <tr
                            key={user.id}
                            className="bg-white border-b white:bg-gray-800 white:border-gray-700 hover:bg-gray-50 white:hover:bg-gray-600"
                        >
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap white:text-white">
                                {user.name}
                            </td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4">
                                {user.role === 'teacher' ? 'Teacher' : 'Student'}
                            </td>
                            <td className="px-6 py-4">
                                {user.cv ? (
                                    <a href={user.cv} target="_blank" rel="noopener noreferrer">{user.cv_name}</a>
                                ) : (
                                    "-"
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                {user.role === 'teacher' ? (
                                    <button
                                        onClick={() => revokeTeacher(user.id)}
                                        className="font-medium text-red-600 white:text-red-500 hover:underline"
                                    >
                                        Revoke
                                    </button>
                                ) : (
                                    user.cv && (
                                        <button
                                            onClick={() => approveProfile(user.id)}
                                            className="font-medium text-blue-600 white:text-blue-500 hover:underline"
                                        >
                                            Approve
                                        </button>
                                    )
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-5 mb-5 mr-2 float-right">
                <nav aria-label="Page navigation example">
                    <ul className="flex items-center -space-x-px h-8 text-sm">
                        <li>
                            <button
                                onClick={() => fetchUsers("prev")}
                                className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 white:bg-gray-800 white:border-gray-700 white:text-gray-400 white:hover:bg-gray-700 white:hover:text-white"
                            >
                                Previous
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => fetchUsers("next")}
                                className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 white:bg-gray-800 white:border-gray-700 white:text-gray-400 white:hover:bg-gray-700 white:hover:text-white"
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default AccessTeacher;