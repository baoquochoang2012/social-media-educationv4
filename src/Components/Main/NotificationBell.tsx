import React, { useEffect, useState, useContext } from "react";
import { onSnapshot, collection, query, where } from "firebase/firestore";
import { AuthContext } from "../AppContext/AppContext"; // Assuming you have AuthContext for user info
import { db } from "../firebase/firebase"; // Your Firestore instance

const NotificationBell = () => {
  const { user } = useContext(AuthContext); // Get the logged-in user context
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.uid) {
      // Reference to the current user's notifications collection
      const notificationsRef = collection(db, "notifi", user.uid, "notifications");

      // Query to get notifications
      const q = query(notificationsRef);

      // Real-time listener for new notifications
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newNotifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotifications(newNotifications);

        // Calculate the number of unread notifications
        const unreadCount = newNotifications.filter((noti) => !noti.read).length;
        setUnreadCount(unreadCount);
      });

      // Cleanup the listener on component unmount
      return () => unsubscribe();
    }
  }, [user?.uid]);

  return (
    <div>
      {/* Display notification bell with unread count */}
      <div className="notification-bell">
        <svg
          className="h-6 w-6 text-gray-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-5-5.917V5a3 3 0 00-6 0v.083A6.002 6.002 0 002 11v3.159c0 .53-.21 1.04-.595 1.436L0 17h5m5 0v1a3 3 0 006 0v-1m-6 0h6"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span> // Display count if there are unread notifications
        )}
      </div>

      {/* Optional: Show a list of notifications */}
      <div className="notifications-list">
        {notifications.map((noti) => (
          <div key={noti.id} className={`notification-item ${noti.read ? 'read' : 'unread'}`}>
            <p>{noti.message}</p>
            <span>{new Date(noti.timestamp?.seconds * 1000).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationBell;
