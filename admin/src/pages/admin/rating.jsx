import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { FiMoreVertical, FiTrash2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const reviewsData = [
  { id: 1, name: "Mario Luigi", rating: 4, review: "Light texture, absorbs quickly.", date: "20 Aug 2023", location: "Germany" },
  { id: 2, name: "John Wick", rating: 5, review: "Best skincare product so far.", date: "22 Aug 2023", location: "USA" },
  { id: 3, name: "Tony Stark", rating: 3, review: "Needs extra hydration for dry skin.", date: "25 Aug 2023", location: "UK" },
  { id: 4, name: "Bruce Wayne", rating: 5, review: "Premium feel and great results.", date: "27 Aug 2023", location: "USA" },
  { id: 5, name: "Peter Parker", rating: 4, review: "Non-sticky and light.", date: "28 Aug 2023", location: "USA" },
  { id: 6, name: "Clark Kent", rating: 5, review: "Highly recommend for daily use.", date: "29 Aug 2023", location: "Canada" },
  { id: 7, name: "Natasha Romanoff", rating: 4, review: "Gentle and effective.", date: "30 Aug 2023", location: "Russia" },
  { id: 8, name: "Steve Rogers", rating: 5, review: "Skin feels healthier.", date: "31 Aug 2023", location: "USA" },
  { id: 9, name: "Diana Prince", rating: 5, review: "Elegant and powerful formula.", date: "1 Sep 2023", location: "France" },
  { id: 10, name: "Barry Allen", rating: 4, review: "Quick absorption.", date: "2 Sep 2023", location: "USA" },
  { id: 11, name: "Arthur Curry", rating: 4, review: "Works well in humid weather.", date: "3 Sep 2023", location: "Australia" },
];

export default function Reviews() {
  const [reviews, setReviews] = useState(reviewsData);
  const [filterRating, setFilterRating] = useState("all");
  const [openMenu, setOpenMenu] = useState(null);

  const filteredReviews =
    filterRating === "all"
      ? reviews
      : reviews.filter((r) => r.rating === Number(filterRating));

  const deleteReview = (id) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setOpenMenu(null);
  };

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.heading}>Customer Reviews</h2>

        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          style={styles.neonSelect}
        >
          <option value="all">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} Stars
            </option>
          ))}
        </select>
      </div>

      {/* Reviews */}
      <div style={styles.list}>
        {filteredReviews.map((r, index) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{
              y: -8,
              scale: 1.02,
              boxShadow:
                "0 0 16px #ffeedd, 0 0 40px #ffd8be",
              borderColor: "#9381ff",
            }}
            style={styles.card}
          >
            <div style={styles.top}>
              <div>
                <strong>{r.name}</strong>
                <div style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <FaStar
                      key={i}
                      size={14}
                      color={i <= r.rating ? "#facc15" : "#e5e7eb"}
                    />
                  ))}
                </div>
              </div>

              {/* Action Menu */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() =>
                    setOpenMenu(openMenu === r.id ? null : r.id)
                  }
                  style={styles.menuBtn}
                >
                  <FiMoreVertical />
                </button>

                <AnimatePresence>
                  {openMenu === r.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      style={styles.menu}
                    >
                      <button
                        onClick={() => deleteReview(r.id)}
                        style={styles.menuItem}
                      >
                        <FiTrash2 />
                        Delete Review
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <p style={styles.text}>{r.review}</p>

            <div style={styles.footer}>
              <span>{r.date}</span>
              <span>{r.location}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  wrapper: { padding: 24 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  heading: { fontSize: 22, fontWeight: 600 },
  neonSelect: {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid #9381ff",
    boxShadow: "0 0 12px #ffd8be",
    outline: "none",
  },
  list: { display: "flex", flexDirection: "column", gap: 18 },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 18,
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  stars: { display: "flex", gap: 4, marginTop: 4 },
  text: { fontSize: 14, color: "#374151", lineHeight: 1.6 },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#6b7280",
  },
  menuBtn: {
    padding: 6,
    borderRadius: 8,
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },
  menu: {
    position: "absolute",
    right: 0,
    top: 30,
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    zIndex: 20,
    overflow: "hidden",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "#dc2626",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    width: "100%",
  },
};







