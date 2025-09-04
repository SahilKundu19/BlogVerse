# BlogVerse

A modern, full-featured blogging platform built with React, TypeScript, and Supabase. This project provides a seamless writing experience with markdown support, user authentication, commenting system, and responsive design.



## Screenshots of BlogVerse

- Light Mode
  ![BlogVerse Screenshot](https://github.com/SahilKundu19/BlogVerse/blob/0feb7aeb116a795ae3c237bff6eab6e3b2f238cb/BlogVerse-Light_Mode.png)
  
- Dark Mode
  ![BlogVerse Screenshot](https://github.com/SahilKundu19/BlogVerse/blob/0feb7aeb116a795ae3c237bff6eab6e3b2f238cb/BlogVerse-Dark_Mode.png)
  
- Mobile View
  ![BlogVerse Screenshot](https://github.com/SahilKundu19/BlogVerse/blob/0feb7aeb116a795ae3c237bff6eab6e3b2f238cb/BlogVerse-Mobile_Version.png) 



## 🚀 Features


### Core Functionality
- **User Authentication**: Email/password login 
- **Blog Management**: Create, edit, publish, and delete blog posts with markdown support
- **Rich Text Editor**: Markdown-based editor for writing and formatting content
- **Comment System**: Interactive commenting on blog posts
- **User Profiles**: Comprehensive user profiles with social links and preferences
- **Search & Filtering**: Full-text search and tag-based filtering of blogs
- **Pagination**: Efficient loading of blog lists with pagination
- **Dark Mode**: Complete dark/light theme support


### User Experience
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Real-time Updates**: Live updates using Supabase real-time features
- **Toast Notifications**: User-friendly feedback with toast messages
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: Comprehensive error handling with user feedback


### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Modern UI Components**: Built with Radix UI primitives and Tailwind CSS
- **Serverless Backend**: Supabase functions for API endpoints
- **Database Integration**: PostgreSQL database via Supabase
- **File Storage**: Supabase Storage for user avatars and media
- **Authentication**: Secure authentication with Supabase Auth



## 🛠️ Tech Stack


### Frontend
- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript 5.5.3** - Type-safe JavaScript
- **Vite 6.2.1** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI primitives


### Backend & Database
- **Supabase** - Backend-as-a-Service platform
- **PostgreSQL** - Primary database
- **Supabase Auth** - Authentication and authorization
- **Supabase Storage** - File storage and CDN
- **Supabase Edge Functions** - Serverless API functions


### UI & UX Libraries
- **Lucide React** - Beautiful icon library
- **Sonner** - Toast notification system
- **React Hook Form** - Form state management
- **React Day Picker** - Date picker component
- **Recharts** - Chart and data visualization
- **React Resizable Panels** - Resizable layout components
- **Embla Carousel** - Touch-friendly carousel component
- **Input OTP** - One-time password input
- **CMDk** - Command palette component


### Development Tools
- **ESLint** - Code linting and formatting
- **Vitest** - Unit testing framework
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing



## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sort-ascending-2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update the Supabase configuration in `src/utils/supabase/`

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`



## 🏗️ Project Structure

```
sort-ascending-2/
├── public/
│   ├── open-book.png          # Application favicon
│   └── index.html             # Main HTML template
├── src/
│   ├── components/
│   │   ├── ui/                # Reusable UI components (Radix UI based)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...            # Other UI components
│   │   ├── AuthForm.tsx       # Authentication form component
│   │   ├── BlogCard.tsx       # Blog preview card
│   │   ├── BlogGrid.tsx       # Blog listing grid
│   │   ├── BlogViewer.tsx     # Full blog post viewer
│   │   ├── CommentSection.tsx # Comments display and input
│   │   ├── Header.tsx         # Main navigation header
│   │   ├── MarkdownEditor.tsx # Rich text editor
│   │   ├── ProfileSettings.tsx # User profile settings
│   │   ├── UserProfile.tsx    # User profile display
│   │   └── figma/             # Figma-specific components
│   ├── supabase/
│   │   └── functions/
│   │       └── server/        # Supabase Edge Functions
│   │           ├── index.tsx
│   │           └── kv_store.tsx
│   ├── utils/
│   │   └── supabase/          # Supabase client configuration
│   │       ├── client.tsx
│   │       └── info.tsx
│   ├── styles/
│   │   └── globals.css        # Global styles and Tailwind imports
│   ├── guidelines/
│   │   └── Guidelines.md      # Project guidelines
│   ├── Attributions.md        # Third-party attributions
│   ├── App.tsx                # Main application component
│   ├── main.tsx               # Application entry point
│   └── index.css              # Additional styles
├── package.json               # Project dependencies and scripts
├── vite.config.ts             # Vite configuration
└── README.md                  # This file
```


## 🚀 Usage

### For Writers
1. **Sign Up/Login**: Create an account or sign in with Google
2. **Write Blogs**: Use the markdown editor to create rich content
3. **Publish**: Publish immediately or save as draft
4. **Manage Content**: Edit, delete, or view your published blogs
5. **Engage**: Read and comment on other users' blogs


### For Readers
1. **Browse**: Explore blogs on the home page
2. **Search**: Use search bar to find specific content
3. **Filter**: Filter blogs by tags
4. **Read**: Click on any blog to read full content
5. **Comment**: Leave comments on blogs (requires account)
6. **Follow**: View author profiles and their other work


### Key Features Overview
- **Home Page**: Featured blogs, statistics, and latest posts
- **Authentication**: Secure login with email or Google
- **Blog Creation**: Intuitive markdown editor with preview
- **Profile Management**: Customize your profile and preferences
- **Search & Discovery**: Find content through search and tags
- **Responsive Design**: Works seamlessly on all devices


## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build


### Code Style
- Uses ESLint for code linting
- TypeScript for type safety
- Follows React best practices
- Component-based architecture


### API Integration
The application integrates with Supabase for:
- User authentication
- Blog CRUD operations
- Comment management
- User profile data
- File uploads (avatars, etc.)


## 📄 Attributions

This project includes components from:
- **[shadcn/ui](https://ui.shadcn.com/)** - Used under MIT license
- **[Unsplash](https://unsplash.com)** - Photos used under Unsplash license


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


---

