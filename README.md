# NoteFlow

A full-stack note-taking application built with React Native (Expo), Bun + Express, and PostgreSQL. It includes Clerk authentication and AI-powered note summarization via LangChain with Groq models.

## Features

- **User Authentication**: Secure authentication powered by Clerk
- **Create & Edit Notes**: Intuitive interface for note management
- **AI Note Summarization**: Summarize notes using LLaMA 3.3 via Groq, powered by  LangChain
- **Real-time Sync**: Notes are synced with a PostgreSQL database
- **Cross-Platform**: Mobile app runs on iOS, Android, and Web
- **Type-Safe**: Full TypeScript implementation across frontend and backend with zod
- **Modern Stack**: Built with latest technologies and best practices

## 📋 Tech Stack

### Backend
- **Runtime**: Bun
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk Express SDK
- **validation**: zod
- **AI work**: LangChain with Groq models


### Mobile (Frontend)
- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Authentication**: Clerk Expo SDK
- **HTTP Client**: Axios


## 📷 Screenshots

<table align="center">
  <tr>
    <td align="center"><img src="mobile/assets/readme-assets/SignInScreen.jpg" alt="Sign In" width="240"/><br/><b>Sign In</b></td>
    <td align="center"><img src="mobile/assets/readme-assets/SignUpScreen.jpg" alt="Sign Up" width="240"/><br/><b>Sign Up</b></td>
    <td align="center"><img src="mobile/assets/readme-assets/HomeScreen.jpg" alt="Home Screen" width="240"/><br/><b>Home</b></td>
  </tr>
  <tr>
    <td align="center"><img src="mobile/assets/readme-assets/Create_Note.jpg" alt="Create Note" width="240"/><br/><b>Create Note</b></td>
    <td align="center"><img src="mobile/assets/readme-assets/View_Note.jpg" alt="View Note" width="240"/><br/><b>View Note</b></td>
    <td align="center"><img src="mobile/assets/readme-assets/Edit_Note.jpg" alt="Edit Note" width="240"/><br/><b>Edit Note</b></td>
  </tr>
  <tr>
    <td align="center"><img src="mobile/assets/readme-assets/Note_Summarizing.jpg" alt="Note Summarizing" width="240"/><br/><b>Summarizing</b></td>
    <td align="center"><img src="mobile/assets/readme-assets/AI_Summary.jpg" alt="AI Summary" width="240"/><br/><b>AI Summary</b></td>
    <td></td>
  </tr>
</table>



## 👤 Author

**Irfan Mehmud**
- GitHub: [@Irfan140](https://github.com/Irfan140)