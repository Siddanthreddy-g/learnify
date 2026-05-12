require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
const { Quiz } = require('./models/LearningModels');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Course.deleteMany({});
  await Quiz.deleteMany({});
  console.log('Cleared existing data');

  const instructors = await User.insertMany([
    { name: 'Sarah Chen', email: 'sarah@learnify.com', password: await bcrypt.hash('password123', 12), role: 'instructor', bio: 'Senior Software Engineer at Google with 10 years of experience.', xp: 5000 },
    { name: 'Marcus Williams', email: 'marcus@learnify.com', password: await bcrypt.hash('password123', 12), role: 'instructor', bio: 'UI/UX Designer, former design lead at Airbnb.', xp: 4200 },
    { name: 'Priya Patel', email: 'priya@learnify.com', password: await bcrypt.hash('password123', 12), role: 'instructor', bio: 'Data Scientist and ML Engineer, PhD from MIT.', xp: 6100 },
    { name: 'James O\'Connor', email: 'james@learnify.com', password: await bcrypt.hash('password123', 12), role: 'instructor', bio: 'Entrepreneur and business strategist. Founded 3 startups.', xp: 3800 },
  ]);

  const students = await User.insertMany([
    { name: 'Emma Thompson', email: 'emma@student.com', password: await bcrypt.hash('password123', 12), role: 'student', xp: 3400, streak: 30 },
    { name: 'Fatima Hassan', email: 'fatima@student.com', password: await bcrypt.hash('password123', 12), role: 'student', xp: 2100, streak: 21 },
    { name: 'Alex Rivera', email: 'alex@student.com', password: await bcrypt.hash('password123', 12), role: 'student', xp: 1240, streak: 14 },
    { name: 'Yuki Tanaka', email: 'yuki@student.com', password: await bcrypt.hash('password123', 12), role: 'student', xp: 980, streak: 9 },
    { name: 'Carlos Mendez', email: 'carlos@student.com', password: await bcrypt.hash('password123', 12), role: 'student', xp: 760, streak: 5 },
  ]);

  const courseTemplates = [
    {
      title: 'The Complete React Developer Course',
      shortDescription: 'Build modern web apps with React 18, hooks, context, and Redux.',
      description: 'A comprehensive course covering everything you need to build professional React applications from fundamentals to advanced patterns used at top tech companies.',
      instructor: instructors[0]._id,
      category: 'Programming', level: 'intermediate', price: 89,
      tags: ['react', 'javascript', 'frontend', 'hooks'], isPublished: true,
      totalStudents: 8420, averageRating: 4.8,
      whatYouLearn: ['Build React apps from scratch','Master hooks: useState, useEffect, useContext','Manage global state with Redux Toolkit','Implement authentication and protected routes','Optimize performance with memoization','Deploy production apps to Vercel'],
      requirements: ['Basic HTML, CSS and JavaScript knowledge'],
      modules: [
        { title: 'React Fundamentals', order: 1, lessons: [
          { title: 'Setting up your development environment', order: 1, duration: 720, isFree: true, description: 'Install Node.js, VS Code extensions, and create your first React app with Vite. We cover the full toolchain setup so you can start building immediately.' },
          { title: 'JSX and component architecture', order: 2, duration: 1080, description: 'Understand JSX syntax, how it compiles to JavaScript, and how to structure components effectively for maintainability.' },
          { title: 'Props and component communication', order: 3, duration: 960, description: 'Pass data between components using props. Understand unidirectional data flow and how to design clean component APIs.' },
          { title: 'State management with useState', order: 4, duration: 1200, description: 'Manage local component state and trigger re-renders. Understand batching and common state patterns.' },
        ]},
        { title: 'Advanced Hooks', order: 2, lessons: [
          { title: 'useEffect and the component lifecycle', order: 1, duration: 1440, description: 'Handle side effects, API calls, subscriptions, and cleanup functions. Master the dependency array.' },
          { title: 'useContext for global state', order: 2, duration: 960, description: 'Share state across the component tree without prop drilling. Build a full auth context from scratch.' },
          { title: 'useReducer for complex state', order: 3, duration: 1080, description: 'Manage complex state logic with reducers and actions. The foundation for understanding Redux.' },
          { title: 'Building custom hooks', order: 4, duration: 1320, description: 'Extract and reuse stateful logic. Build useFetch, useLocalStorage, and useDebounce hooks.' },
        ]},
        { title: 'Real Projects', order: 3, lessons: [
          { title: 'Project: Full task management app', order: 1, duration: 2400, description: 'Build a complete CRUD task manager with drag-and-drop, filters, and local persistence.' },
          { title: 'Project: Real-time dashboard', order: 2, duration: 2880, description: 'Build a data dashboard fetching from a live API with charts, filters, and CSV export.' },
        ]},
      ],
      reviews: [
        { user: students[0]._id, rating: 5, comment: 'Best React course I have taken. The projects are exactly what employers look for.' },
        { user: students[1]._id, rating: 5, comment: 'Sarah explains every concept so clearly. Went from zero to building production apps.' },
      ],
      quizzes: [
        { afterModuleIndex: 0, afterLessonIndex: 1, title: 'JSX and Components Check', passingScore: 70, questions: [
          { question: 'What does JSX stand for?', options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extra'], correctIndex: 0, explanation: 'JSX stands for JavaScript XML. It is a syntax extension for JavaScript.' },
          { question: 'Which hook is used to manage local component state?', options: ['useEffect', 'useContext', 'useState', 'useReducer'], correctIndex: 2, explanation: 'useState is the primary hook for managing local state in a functional component.' },
          { question: 'In React, data flows in which direction?', options: ['Bidirectionally', 'Bottom to top', 'Top to bottom (unidirectional)', 'Sideways between siblings'], correctIndex: 2, explanation: 'React uses unidirectional data flow — data passes from parent to child via props.' },
          { question: 'What must every React component return?', options: ['A string', 'JSX or null', 'An object', 'An array'], correctIndex: 1, explanation: 'React components must return JSX or null.' },
        ]},
        { afterModuleIndex: 1, afterLessonIndex: 1, title: 'Hooks Knowledge Check', passingScore: 70, questions: [
          { question: 'What is the second argument to useEffect?', options: ['A callback function', 'The dependency array', 'The initial state', 'A cleanup function'], correctIndex: 1, explanation: 'The dependency array controls when the effect re-runs.' },
          { question: 'When does useEffect run with an empty dependency array?', options: ['On every render', 'Only on unmount', 'Only on mount', 'Never'], correctIndex: 2, explanation: 'An empty dependency array means the effect runs only once after the initial mount.' },
          { question: 'Which hook replaces the need for prop drilling?', options: ['useState', 'useRef', 'useContext', 'useCallback'], correctIndex: 2, explanation: 'useContext allows components to consume context values without prop drilling.' },
        ]},
      ],
    },
    {
      title: 'Node.js & Express: Backend Development Masterclass',
      shortDescription: 'Master server-side JavaScript with Node.js, Express, MongoDB and REST APIs.',
      description: 'Learn to build scalable, production-ready backend services. Covers REST APIs, authentication, databases, file uploads, and deployment.',
      instructor: instructors[0]._id,
      category: 'Programming', level: 'intermediate', price: 79,
      tags: ['nodejs', 'express', 'mongodb', 'backend'], isPublished: true,
      totalStudents: 5230, averageRating: 4.7,
      whatYouLearn: ['Build RESTful APIs with Express.js','Integrate MongoDB with Mongoose','Implement JWT authentication','Handle file uploads with Multer','Write tests with Jest','Deploy to Railway and AWS'],
      requirements: ['JavaScript fundamentals', 'Basic understanding of HTTP'],
      modules: [
        { title: 'Node.js Core', order: 1, lessons: [
          { title: 'How Node.js works under the hood', order: 1, duration: 960, isFree: true, description: 'Event loop, non-blocking I/O, and the V8 engine explained with diagrams.' },
          { title: 'Modules and the CommonJS system', order: 2, duration: 720, description: 'Built-in modules, require, and module.exports patterns.' },
          { title: 'File system and streams', order: 3, duration: 1080, description: 'Read and write files, work with streams and buffers efficiently.' },
        ]},
        { title: 'Express & REST APIs', order: 2, lessons: [
          { title: 'Building your first Express server', order: 1, duration: 840, description: 'Routing, middleware, and the request/response cycle explained.' },
          { title: 'REST API design principles', order: 2, duration: 1080, description: 'Resource naming, HTTP methods, status codes, and API versioning.' },
          { title: 'JWT authentication from scratch', order: 3, duration: 1440, description: 'Sign tokens, verify tokens, refresh tokens, and protect routes.' },
        ]},
      ],
      reviews: [
        { user: students[2]._id, rating: 5, comment: 'Incredibly detailed. The JWT auth section alone is worth the price.' },
      ],
      quizzes: [
        { afterModuleIndex: 0, afterLessonIndex: 0, title: 'Node.js Fundamentals Quiz', passingScore: 70, questions: [
          { question: 'Node.js uses which JavaScript engine?', options: ['SpiderMonkey', 'V8', 'Chakra', 'Hermes'], correctIndex: 1, explanation: 'Node.js is built on Chrome\'s V8 JavaScript engine.' },
          { question: 'What is the event loop in Node.js?', options: ['A for loop', 'A mechanism to handle async operations', 'A type of database', 'A web server'], correctIndex: 1, explanation: 'The event loop allows Node.js to perform non-blocking I/O operations.' },
          { question: 'Which method is used to import a module in CommonJS?', options: ['import', 'require', 'fetch', 'load'], correctIndex: 1, explanation: 'require() is the CommonJS way to import modules in Node.js.' },
        ]},
      ],
    },
    {
      title: 'UI/UX Design: From Wireframes to High-Fidelity Prototypes',
      shortDescription: 'Learn professional product design using Figma, design systems, and user research.',
      description: 'A complete design course covering user research, wireframing, visual design, prototyping, and handoff to developers.',
      instructor: instructors[1]._id,
      category: 'Design', level: 'beginner', price: 69,
      tags: ['figma', 'ux', 'ui', 'design'], isPublished: true,
      totalStudents: 12400, averageRating: 4.9,
      whatYouLearn: ['Conduct user research and create personas','Build wireframes in Figma','Apply color theory and typography','Create interactive prototypes','Build scalable design systems','Hand off designs to developers'],
      requirements: ['No prior design experience needed', 'A free Figma account'],
      modules: [
        { title: 'Design Thinking', order: 1, lessons: [
          { title: 'Introduction to design thinking', order: 1, duration: 840, isFree: true, description: 'The 5 stages of design thinking and how to apply them to real product problems.' },
          { title: 'User research methods', order: 2, duration: 1200, description: 'Interviews, surveys, contextual inquiry, and usability testing techniques.' },
          { title: 'Creating user personas and journey maps', order: 3, duration: 960, description: 'Synthesize research into actionable design artifacts.' },
        ]},
        { title: 'Visual Design', order: 2, lessons: [
          { title: 'Color theory for digital interfaces', order: 1, duration: 1080, description: 'Color models, contrast, accessibility standards, and palette creation.' },
          { title: 'Typography that works', order: 2, duration: 900, description: 'Type scales, pairing fonts, and readability guidelines.' },
          { title: 'Figma components and auto layout', order: 3, duration: 1440, description: 'Build reusable components with variants, properties, and auto layout.' },
        ]},
      ],
      reviews: [
        { user: students[0]._id, rating: 5, comment: 'I landed my first design job after completing this course.' },
        { user: students[3]._id, rating: 5, comment: 'The Figma sections are gold. I use these every day at work.' },
      ],
      quizzes: [
        { afterModuleIndex: 0, afterLessonIndex: 0, title: 'Design Thinking Quiz', passingScore: 70, questions: [
          { question: 'How many stages are in the design thinking process?', options: ['3', '4', '5', '6'], correctIndex: 2, explanation: 'Design thinking has 5 stages: Empathize, Define, Ideate, Prototype, Test.' },
          { question: 'What is the primary goal of user research?', options: ['To validate assumptions', 'To understand user needs and behaviors', 'To create wireframes', 'To write code'], correctIndex: 1, explanation: 'User research helps designers understand real user needs, goals, and pain points.' },
          { question: 'A user persona is:', options: ['A real user account', 'A fictional character representing a user segment', 'A design mockup', 'A usability test'], correctIndex: 1, explanation: 'Personas are fictional representations of your target users based on research.' },
        ]},
        { afterModuleIndex: 1, afterLessonIndex: 0, title: 'Color and Typography Quiz', passingScore: 70, questions: [
          { question: 'What is the minimum contrast ratio for normal text (WCAG AA)?', options: ['2:1', '3:1', '4.5:1', '7:1'], correctIndex: 2, explanation: 'WCAG AA requires a minimum contrast ratio of 4.5:1 for normal text.' },
          { question: 'In typography, what is a type scale?', options: ['The size of a font file', 'A system of proportionally related font sizes', 'The weight of a font', 'The line height'], correctIndex: 1, explanation: 'A type scale is a set of font sizes with a consistent ratio between them.' },
        ]},
      ],
    },
    {
      title: 'Machine Learning with Python: A to Z',
      shortDescription: 'Build ML models from scratch using scikit-learn, TensorFlow, and PyTorch.',
      description: 'A rigorous, mathematics-grounded course on machine learning. Understand the algorithms deeply then implement with industry-standard tools.',
      instructor: instructors[2]._id,
      category: 'Data Science', level: 'advanced', price: 99,
      tags: ['python', 'ml', 'tensorflow', 'scikit-learn'], isPublished: true,
      totalStudents: 7850, averageRating: 4.8,
      whatYouLearn: ['Linear algebra and statistics for ML','Regression, classification, and clustering','Neural networks with TensorFlow','Model evaluation and validation','Deploy ML models as REST APIs','Handle real datasets with pandas'],
      requirements: ['Python basics', 'High school level math'],
      modules: [
        { title: 'ML Foundations', order: 1, lessons: [
          { title: 'What is machine learning?', order: 1, duration: 720, isFree: true, description: 'Supervised, unsupervised, and reinforcement learning explained with real examples.' },
          { title: 'Python for data science', order: 2, duration: 1440, description: 'NumPy, pandas, and matplotlib crash course with exercises.' },
          { title: 'Linear regression from scratch', order: 3, duration: 1800, description: 'Cost function, gradient descent, and normal equation — built by hand then with sklearn.' },
        ]},
        { title: 'Deep Learning', order: 2, lessons: [
          { title: 'Neural networks and backpropagation', order: 1, duration: 2400, description: 'Forward pass, loss functions, and gradient descent through a network.' },
          { title: 'Convolutional neural networks', order: 2, duration: 2100, description: 'Image recognition with CNNs built in TensorFlow.' },
        ]},
      ],
      reviews: [
        { user: students[1]._id, rating: 5, comment: 'The most rigorous ML course online. Priya does not skip the math.' },
      ],
      quizzes: [
        { afterModuleIndex: 0, afterLessonIndex: 0, title: 'ML Fundamentals Quiz', passingScore: 70, questions: [
          { question: 'Which type of ML uses labeled training data?', options: ['Unsupervised learning', 'Reinforcement learning', 'Supervised learning', 'Semi-supervised learning'], correctIndex: 2, explanation: 'Supervised learning trains on labeled input-output pairs.' },
          { question: 'What does gradient descent minimize?', options: ['The learning rate', 'The number of features', 'The loss function', 'The training set size'], correctIndex: 2, explanation: 'Gradient descent iteratively adjusts parameters to minimize the loss function.' },
          { question: 'What is overfitting?', options: ['The model is too simple', 'The model performs well on training data but poorly on new data', 'The model has too few parameters', 'The dataset is too large'], correctIndex: 1, explanation: 'Overfitting occurs when a model memorizes training data but fails to generalize.' },
        ]},
      ],
    },
    {
      title: 'TypeScript: The Complete Developer Guide',
      shortDescription: 'Add type safety to your JavaScript and build more reliable software.',
      description: 'Learn TypeScript from the ground up. Understand the type system deeply and apply it to real React and Node.js projects.',
      instructor: instructors[0]._id,
      category: 'Programming', level: 'intermediate', price: 74,
      tags: ['typescript', 'javascript', 'types'], isPublished: true,
      totalStudents: 6100, averageRating: 4.7,
      whatYouLearn: ['TypeScript structural type system','Interfaces, type aliases, and generics','Type React components and hooks','Utility types and conditional types','Migrate JavaScript to TypeScript','Configure tsconfig properly'],
      requirements: ['Solid JavaScript knowledge'],
      modules: [
        { title: 'TypeScript Basics', order: 1, lessons: [
          { title: 'Why TypeScript and setup', order: 1, duration: 600, isFree: true, description: 'tsconfig, the tsc compiler, and TypeScript playgrounds.' },
          { title: 'Primitive types and inference', order: 2, duration: 840, description: 'string, number, boolean, null, undefined, and never types.' },
          { title: 'Generics in depth', order: 3, duration: 1440, description: 'Generic functions, interfaces, constraints, and defaults.' },
        ]},
      ],
      reviews: [
        { user: students[2]._id, rating: 5, comment: 'Finally TypeScript makes complete sense. Generics section is exceptional.' },
      ],
      quizzes: [
        { afterModuleIndex: 0, afterLessonIndex: 0, title: 'TypeScript Basics Quiz', passingScore: 70, questions: [
          { question: 'TypeScript is a superset of which language?', options: ['Java', 'Python', 'JavaScript', 'C#'], correctIndex: 2, explanation: 'TypeScript is a statically typed superset of JavaScript.' },
          { question: 'What does the "any" type do in TypeScript?', options: ['Throws an error', 'Disables type checking for that variable', 'Makes the variable optional', 'Converts to string'], correctIndex: 1, explanation: '"any" disables type checking — use sparingly.' },
          { question: 'What is a generic in TypeScript?', options: ['A class that extends another', 'A type that works with multiple types via a type parameter', 'A built-in utility type', 'An interface'], correctIndex: 1, explanation: 'Generics allow you to write reusable code that works with any type.' },
        ]},
      ],
    },
    {
      title: 'Product Management: From Idea to Launch',
      shortDescription: 'Learn the complete PM toolkit — roadmaps, user stories, and stakeholder management.',
      description: 'A practical course for aspiring and current product managers covering strategy, discovery, prioritization, and shipping.',
      instructor: instructors[3]._id,
      category: 'Business', level: 'beginner', price: 0,
      tags: ['product-management', 'agile', 'roadmap'], isPublished: true,
      totalStudents: 18700, averageRating: 4.6,
      whatYouLearn: ['Define product vision and OKRs','Competitive analysis and market research','Write product requirements (PRDs)','Prioritize with RICE and MoSCoW','Work with engineers and designers','Measure success with the right metrics'],
      requirements: ['No prior experience required'],
      modules: [
        { title: 'Product Strategy', order: 1, lessons: [
          { title: 'What does a product manager actually do?', order: 1, duration: 720, isFree: true, description: 'Role overview, misconceptions, and a real day in the life of a PM at a top tech company.' },
          { title: 'Defining your product vision', order: 2, duration: 960, description: 'Mission, vision, and strategic pillars that guide every product decision.' },
          { title: 'Prioritization frameworks', order: 3, duration: 960, description: 'RICE scoring, impact vs effort matrix, and MoSCoW method explained.' },
        ]},
      ],
      reviews: [
        { user: students[3]._id, rating: 5, comment: 'Went from engineer to PM using frameworks from this course.' },
      ],
      quizzes: [
        { afterModuleIndex: 0, afterLessonIndex: 0, title: 'PM Fundamentals Quiz', passingScore: 70, questions: [
          { question: 'What does OKR stand for?', options: ['Objectives and Key Results', 'Operations and Key Roadmap', 'Output and Key Revenue', 'Objectives and Key Roadmap'], correctIndex: 0, explanation: 'OKRs (Objectives and Key Results) is a goal-setting framework used by Google, Intel, and others.' },
          { question: 'In the RICE framework, what does RICE stand for?', options: ['Reach, Impact, Confidence, Effort', 'Revenue, Impact, Cost, Execution', 'Reach, Iteration, Complexity, Effort', 'Revenue, Impact, Confidence, Execution'], correctIndex: 0, explanation: 'RICE = Reach × Impact × Confidence ÷ Effort. Used to prioritize features.' },
        ]},
      ],
    },
    {
      title: 'Data Analysis with Python and SQL',
      shortDescription: 'Transform raw data into insights using pandas, SQL, and visualization tools.',
      description: 'Learn to collect, clean, analyze, and visualize data professionally. Work with real datasets from e-commerce and finance.',
      instructor: instructors[2]._id,
      category: 'Data Science', level: 'beginner', price: 59,
      tags: ['python', 'sql', 'pandas', 'data-analysis'], isPublished: true,
      totalStudents: 9300, averageRating: 4.7,
      whatYouLearn: ['Complex SQL with JOINs and window functions','Clean data with pandas','Visualize with Matplotlib and Seaborn','Exploratory data analysis (EDA)','Interactive dashboards with Plotly','Present insights to stakeholders'],
      requirements: ['Basic Python knowledge helpful but not required'],
      modules: [
        { title: 'SQL for Data Analysis', order: 1, lessons: [
          { title: 'SQL basics: SELECT, WHERE, ORDER BY', order: 1, duration: 900, isFree: true, description: 'Query fundamentals with a real e-commerce database.' },
          { title: 'JOINs and relationships', order: 2, duration: 1200, description: 'INNER, LEFT, RIGHT, FULL OUTER joins explained clearly.' },
          { title: 'Aggregations and window functions', order: 3, duration: 1440, description: 'COUNT, SUM, AVG, ROW_NUMBER, RANK, LAG, LEAD, and running totals.' },
        ]},
        { title: 'Python Data Analysis', order: 2, lessons: [
          { title: 'pandas DataFrames', order: 1, duration: 1320, description: 'Loading, inspecting, filtering, and transforming data.' },
          { title: 'Data cleaning techniques', order: 2, duration: 1080, description: 'Handling missing values, outliers, and inconsistent data types.' },
        ]},
      ],
      reviews: [
        { user: students[0]._id, rating: 5, comment: 'Perfect balance of SQL and Python. The real datasets make it practical.' },
      ],
      quizzes: [
        { afterModuleIndex: 0, afterLessonIndex: 0, title: 'SQL Basics Quiz', passingScore: 70, questions: [
          { question: 'Which SQL clause filters rows?', options: ['GROUP BY', 'ORDER BY', 'WHERE', 'HAVING'], correctIndex: 2, explanation: 'WHERE filters rows before aggregation. HAVING filters after aggregation.' },
          { question: 'What does JOIN do in SQL?', options: ['Deletes rows', 'Combines rows from two or more tables', 'Creates a new table', 'Sorts results'], correctIndex: 1, explanation: 'JOIN combines related rows from multiple tables based on a condition.' },
          { question: 'What does SELECT DISTINCT do?', options: ['Selects all rows', 'Selects only unique values', 'Selects the largest value', 'Selects random rows'], correctIndex: 1, explanation: 'SELECT DISTINCT removes duplicate rows from the result set.' },
        ]},
      ],
    },
    {
      title: 'Docker & Kubernetes: Container Orchestration',
      shortDescription: 'Containerize apps with Docker and orchestrate them at scale with Kubernetes.',
      description: 'Learn containerization from scratch. Build Docker images, compose services, and deploy to Kubernetes on AWS EKS.',
      instructor: instructors[0]._id,
      category: 'Programming', level: 'advanced', price: 94,
      tags: ['docker', 'kubernetes', 'devops', 'containers'], isPublished: true,
      totalStudents: 4200, averageRating: 4.9,
      whatYouLearn: ['Build optimized Docker images','Multi-container apps with Docker Compose','Deploy to Kubernetes clusters','Services, deployments, and ingress','CI/CD with GitHub Actions','Monitor with Prometheus and Grafana'],
      requirements: ['Linux command line basics', 'Experience with a web framework'],
      modules: [
        { title: 'Docker', order: 1, lessons: [
          { title: 'Containers vs virtual machines', order: 1, duration: 840, isFree: true, description: 'How containers work at the OS level — namespaces, cgroups, and layered filesystems.' },
          { title: 'Writing Dockerfiles', order: 2, duration: 1200, description: 'Base images, layers, caching strategies, and multi-stage builds.' },
          { title: 'Docker Compose', order: 3, duration: 1440, description: 'Orchestrate multiple services locally with a single docker-compose.yml.' },
        ]},
        { title: 'Kubernetes', order: 2, lessons: [
          { title: 'Kubernetes architecture', order: 1, duration: 1080, description: 'Control plane, nodes, pods, services, and the scheduler.' },
          { title: 'Deployments and rolling updates', order: 2, duration: 1320, description: 'Zero-downtime deployments, replica sets, and rollbacks.' },
        ]},
      ],
      reviews: [
        { user: students[4]._id, rating: 5, comment: 'The most practical DevOps course. I deployed to production on day 3.' },
      ],
      quizzes: [
        { afterModuleIndex: 0, afterLessonIndex: 0, title: 'Docker Fundamentals Quiz', passingScore: 70, questions: [
          { question: 'What is a Docker image?', options: ['A running container', 'A read-only template for creating containers', 'A virtual machine', 'A configuration file'], correctIndex: 1, explanation: 'A Docker image is a read-only template. Containers are running instances of images.' },
          { question: 'What command runs a Docker container?', options: ['docker start', 'docker build', 'docker run', 'docker create'], correctIndex: 2, explanation: 'docker run creates and starts a container from an image.' },
          { question: 'What is a Dockerfile?', options: ['A running container', 'A text file with instructions to build a Docker image', 'A network configuration', 'A database file'], correctIndex: 1, explanation: 'A Dockerfile contains ordered instructions for building a Docker image.' },
        ]},
      ],
    },
    {
      title: 'Growth Marketing: Acquisition, Retention & Revenue',
      shortDescription: 'Build data-driven marketing campaigns across SEO, paid ads, and email.',
      description: 'A hands-on growth marketing course covering the full funnel. Learn to acquire users profitably and build retention loops that compound.',
      instructor: instructors[3]._id,
      category: 'Marketing', level: 'intermediate', price: 64,
      tags: ['marketing', 'growth', 'seo', 'ads', 'email'], isPublished: true,
      totalStudents: 5700, averageRating: 4.5,
      whatYouLearn: ['Run Google and Meta ad campaigns','Drive organic traffic with SEO','Design email sequences that convert','Set up analytics in GA4 and Mixpanel','Run A/B tests correctly','Calculate CAC, LTV, and payback period'],
      requirements: ['Basic familiarity with marketing concepts'],
      modules: [
        { title: 'Growth Fundamentals', order: 1, lessons: [
          { title: 'The growth mindset and AARRR framework', order: 1, duration: 720, isFree: true, description: 'Acquisition, Activation, Retention, Revenue, Referral explained with real examples.' },
          { title: 'Setting up your analytics stack', order: 2, duration: 1080, description: 'GA4, Mixpanel, and event tracking setup from scratch.' },
          { title: 'Google Ads from scratch', order: 3, duration: 1800, description: 'Campaigns, ad groups, keywords, bidding strategies, and conversion tracking.' },
        ]},
      ],
      reviews: [
        { user: students[2]._id, rating: 5, comment: 'Ran my first profitable campaign in week 2. Incredible course.' },
      ],
      quizzes: [
        { afterModuleIndex: 0, afterLessonIndex: 0, title: 'Growth Marketing Quiz', passingScore: 70, questions: [
          { question: 'What does AARRR stand for?', options: ['Ads, Analytics, Revenue, Retention, ROI', 'Acquisition, Activation, Retention, Revenue, Referral', 'Awareness, Attention, Reach, Retention, Revenue', 'Acquisition, Ads, Reach, Revenue, ROI'], correctIndex: 1, explanation: 'AARRR (Pirate Metrics) = Acquisition, Activation, Retention, Revenue, Referral.' },
          { question: 'What is CAC?', options: ['Customer Acquisition Cost', 'Click Attribution Channel', 'Content and Creative', 'Conversion and Click'], correctIndex: 0, explanation: 'CAC is the total cost of acquiring one new customer, including all marketing spend.' },
        ]},
      ],
    },
    {
      title: 'iOS Development with Swift and SwiftUI',
      shortDescription: 'Build native iPhone apps using Swift 5 and SwiftUI. Ship to the App Store.',
      description: 'A complete course for building beautiful iOS applications. Covers SwiftUI, data persistence, networking, and App Store submission.',
      instructor: instructors[0]._id,
      category: 'Programming', level: 'intermediate', price: 89,
      tags: ['swift', 'swiftui', 'ios', 'apple'], isPublished: true,
      totalStudents: 3900, averageRating: 4.8,
      whatYouLearn: ['Write Swift code confidently','Build adaptive layouts with SwiftUI','Persist data with Core Data','Fetch data from REST APIs','Integrate native features','Submit to the App Store'],
      requirements: ['No Swift experience needed', 'A Mac with Xcode'],
      modules: [
        { title: 'Swift Basics', order: 1, lessons: [
          { title: 'Variables, constants, and types', order: 1, duration: 840, isFree: true, description: 'Swift syntax, type inference, and the type system.' },
          { title: 'Optionals and error handling', order: 2, duration: 1080, description: 'Optional chaining, guard statements, and do-catch.' },
          { title: 'SwiftUI views and state', order: 3, duration: 1440, description: '@State, @Binding, @ObservedObject, and @EnvironmentObject.' },
        ]},
      ],
      reviews: [
        { user: students[3]._id, rating: 5, comment: 'My app is now live on the App Store thanks to this course.' },
      ],
      quizzes: [
        { afterModuleIndex: 0, afterLessonIndex: 0, title: 'Swift Basics Quiz', passingScore: 70, questions: [
          { question: 'In Swift, what is the difference between let and var?', options: ['let is faster', 'let declares a constant, var declares a variable', 'var is immutable', 'They are the same'], correctIndex: 1, explanation: 'let declares a constant (immutable), var declares a variable (mutable).' },
          { question: 'What is an optional in Swift?', options: ['A type that may contain a value or nil', 'A function parameter', 'A class method', 'A closure'], correctIndex: 0, explanation: 'Optionals represent values that may be absent — either a value or nil.' },
        ]},
      ],
    },
    {
      title: 'Financial Modelling and Valuation',
      shortDescription: 'Build DCF models, LBO analyses, and comparable company analyses in Excel.',
      description: 'Learn the financial modelling skills used at investment banks and private equity firms. Build real models on real companies.',
      instructor: instructors[3]._id,
      category: 'Business', level: 'advanced', price: 119,
      tags: ['finance', 'excel', 'valuation', 'investment-banking'], isPublished: true,
      totalStudents: 6800, averageRating: 4.9,
      whatYouLearn: ['Build three-statement financial models','Value companies with DCF analysis','Comparable company analysis','LBO models for private equity','Sensitivity and scenario analysis','Present models to senior stakeholders'],
      requirements: ['Basic Excel knowledge'],
      modules: [
        { title: 'Financial Statements', order: 1, lessons: [
          { title: 'Reading and understanding annual reports', order: 1, duration: 1080, isFree: true, description: '10-K structure, key line items, and red flags to watch for.' },
          { title: 'Ratio analysis', order: 2, duration: 1200, description: 'Liquidity, profitability, leverage, and efficiency ratios.' },
          { title: 'Building a three-statement model', order: 3, duration: 2400, description: 'Linking the income statement, balance sheet, and cash flow statement.' },
        ]},
        { title: 'Valuation', order: 2, lessons: [
          { title: 'Discounted cash flow (DCF) analysis', order: 1, duration: 2880, description: 'WACC, terminal value, and sensitivity tables built in Excel.' },
          { title: 'Comparable company analysis', order: 2, duration: 1800, description: 'Selecting peers, spreading multiples, and deriving implied value.' },
        ]},
      ],
      reviews: [
        { user: students[0]._id, rating: 5, comment: 'I used this exact model in my investment banking interview. Got the offer.' },
      ],
      quizzes: [
        { afterModuleIndex: 0, afterLessonIndex: 0, title: 'Financial Statements Quiz', passingScore: 70, questions: [
          { question: 'Which financial statement shows a company\'s profitability over a period?', options: ['Balance Sheet', 'Income Statement', 'Cash Flow Statement', 'Statement of Equity'], correctIndex: 1, explanation: 'The Income Statement (P&L) shows revenues and expenses over a period.' },
          { question: 'What does EBITDA stand for?', options: ['Earnings Before Interest, Taxes, Depreciation, and Amortization', 'Earnings Before Income Tax and Depreciation Adjustments', 'Estimated Baseline Income Tax and Depreciation Analysis', 'Earnings Before International Tax and Distribution Allowances'], correctIndex: 0, explanation: 'EBITDA = Earnings Before Interest, Taxes, Depreciation, and Amortization.' },
          { question: 'What is working capital?', options: ['Total assets minus total liabilities', 'Current assets minus current liabilities', 'Cash and cash equivalents', 'Revenue minus expenses'], correctIndex: 1, explanation: 'Working capital = Current Assets − Current Liabilities. Measures short-term liquidity.' },
        ]},
      ],
    },
    {
      title: 'Graphic Design Fundamentals',
      shortDescription: 'Master visual communication, typography, and brand identity in Adobe Illustrator.',
      description: 'Learn graphic design from first principles. Understand why good design works then apply those principles to logos, brand identities, and digital assets.',
      instructor: instructors[1]._id,
      category: 'Design', level: 'beginner', price: 0,
      tags: ['graphic-design', 'illustrator', 'branding', 'typography'], isPublished: true,
      totalStudents: 22100, averageRating: 4.8,
      whatYouLearn: ['Apply CARP design principles','Choose and pair typefaces','Build cohesive color palettes','Design logos and brand identities','Create print and digital layouts','Export assets for all media'],
      requirements: ['No experience required', 'Adobe Illustrator (free trial available)'],
      modules: [
        { title: 'Design Principles', order: 1, lessons: [
          { title: 'The four principles of good design', order: 1, duration: 960, isFree: true, description: 'CARP: contrast, alignment, repetition, proximity explained with real examples.' },
          { title: 'Working with shapes and form', order: 2, duration: 1080, description: 'Geometric thinking, visual weight, and compositional balance.' },
          { title: 'Understanding negative space', order: 3, duration: 840, description: 'How empty space communicates as powerfully as filled space.' },
        ]},
        { title: 'Brand Identity', order: 2, lessons: [
          { title: 'Logo design process', order: 1, duration: 2400, description: 'Research, sketching, vector execution in Illustrator, and refinement.' },
          { title: 'Building a brand style guide', order: 2, duration: 1800, description: 'Colors, typography, logo usage rules, tone of voice, and examples.' },
        ]},
      ],
      reviews: [
        { user: students[1]._id, rating: 5, comment: 'Free and better than courses I have paid $200 for.' },
        { user: students[4]._id, rating: 5, comment: 'I redesigned our company brand identity after taking this.' },
      ],
      quizzes: [
        { afterModuleIndex: 0, afterLessonIndex: 0, title: 'Design Principles Quiz', passingScore: 70, questions: [
          { question: 'What does CARP stand for in design?', options: ['Color, Alignment, Repetition, Proximity', 'Contrast, Alignment, Repetition, Proximity', 'Contrast, Art, Repetition, Proportion', 'Color, Art, Rhythm, Proximity'], correctIndex: 1, explanation: 'CARP = Contrast, Alignment, Repetition, Proximity. The four fundamental design principles.' },
          { question: 'Negative space in design refers to:', options: ['Dark colors', 'The background or empty areas around the subject', 'Poorly designed elements', 'Low contrast areas'], correctIndex: 1, explanation: 'Negative space is the empty space around and between subjects of an image.' },
          { question: 'Which design principle ensures visual consistency?', options: ['Contrast', 'Alignment', 'Repetition', 'Proximity'], correctIndex: 2, explanation: 'Repetition creates consistency by repeating visual elements throughout a design.' },
        ]},
      ],
    },
  ];

  // Insert courses and quizzes
  let totalQuizzes = 0;
  for (const template of courseTemplates) {
    const { quizzes: quizTemplates, ...courseData } = template;
    const course = await Course.create(courseData);
    await User.findByIdAndUpdate(courseData.instructor, { $push: { createdCourses: course._id } });

    // Create quizzes linked to specific lesson positions
    if (quizTemplates && quizTemplates.length) {
      for (const qt of quizTemplates) {
        const module = course.modules[qt.afterModuleIndex];
        const lesson = module?.lessons[qt.afterLessonIndex];
        if (module && lesson) {
          await Quiz.create({
            course: course._id,
            module: module._id,
            afterLesson: lesson._id,
            title: qt.title,
            passingScore: qt.passingScore,
            timeLimit: 600,
            questions: qt.questions,
          });
          totalQuizzes++;
        }
      }
    }
  }

  console.log(`\nSeeded successfully:`);
  console.log(`  ${instructors.length} instructors`);
  console.log(`  ${students.length} students`);
  console.log(`  ${courseTemplates.length} courses`);
  console.log(`  ${totalQuizzes} quizzes`);
  console.log(`\nTest credentials:`);
  console.log(`  Instructor: sarah@learnify.com / password123`);
  console.log(`  Student:    emma@student.com   / password123`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });

// Run this separately to add quizzes after seeding courses
// node addQuizzes.js
