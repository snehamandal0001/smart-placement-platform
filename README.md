# PlacementHub 🚀

A full-stack MERN application engineered to streamline the campus recruitment and placement process. PlacementHub bridges the gap between students and recruiters by providing secure role-based access, automated AI PDF resume extraction, and dynamic skill matching.

## 🌟 Key Features

*   **Role-Based Access Control (RBAC):** Distinct, secure routing and UI experiences for `Student` and `Recruiter` accounts.
*   **Smart Resume Parsing & Highlighting:** Integrates `pdf-parse` to extract raw text from PDF buffers in memory. The system dynamically cross-references extracted text with recruiter-defined required skills, automatically highlighting matching keywords in the recruiter dashboard.
*   **Secure Authentication:** Implements industry-standard security using `bcryptjs` for password hashing and JSON Web Tokens (JWT) for stateless session management.
*   **Advanced Data Management:** Features cascading database deletions to prevent orphaned records (e.g., automatically deleting all associated student applications when a recruiter removes a job post).
*   **Real-Time UI Updates:** Seamless React state management ensures instant visual feedback when applying, editing, or deleting listings without browser refreshes.

## 🛠️ Technical Stack

**Frontend:**
*   React.js
*   Tailwind CSS (Responsive UI/UX)
*   React Router DOM
*   Axios (API integration)

**Backend:**
*   Node.js & Express.js
*   MongoDB & Mongoose (ODM)
*   JWT (Authentication) & Bcrypt.js (Encryption)
*   Multer (File handling) & PDF-Parse (Data extraction)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB local instance or MongoDB Atlas URI

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/snehamandal0001/placement-platform.git](https://github.com/snehamandal0001/placement-platform.git)
   cd placement-platform

### 👨‍💻 Author
Sneha Mandal

*  GitHub: [@snehamandal0001](https://github.com/snehamandal0001)

*  LinkedIn: [https://www.linkedin.com/in/sneha-mandal-a7581228b?utm_source=share_via&utm_content=profile&utm_medium=member_android](https://www.linkedin.com/in/sneha-mandal-a7581228b?utm_source=share_via&utm_content=profile&utm_medium=member_android)

Built with ❤️ for modern university placements.