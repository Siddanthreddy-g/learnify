require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');
const { Quiz } = require('./models/LearningModels');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');
  await Quiz.deleteMany({});

  const courses = await Course.find({ isPublished: true }).limit(4);

  for (const course of courses) {
    for (const mod of course.modules) {
      for (let i = 0; i < mod.lessons.length; i++) {
        const lesson = mod.lessons[i];
        // Add quiz after every 2nd lesson
        if ((i + 1) % 2 === 0) {
          await Quiz.create({
            course: course._id,
            module: mod._id,
            afterLesson: lesson._id,
            title: `${mod.title} — Knowledge Check`,
            passingScore: 70,
            questions: [
              {
                question: `What is the primary focus of "${lesson.title}"?`,
                options: [
                  `Understanding the core concepts covered in this lesson`,
                  `Building a complete application from scratch`,
                  `Installing development tools only`,
                  `Writing documentation`,
                ],
                correctIndex: 0,
                explanation: `This lesson focuses on understanding core concepts as a foundation for everything that follows.`,
              },
              {
                question: `Which approach is recommended when learning ${course.category}?`,
                options: [
                  `Memorize everything without practicing`,
                  `Practice with real projects alongside theory`,
                  `Skip fundamentals and jump to advanced topics`,
                  `Only read documentation`,
                ],
                correctIndex: 1,
                explanation: `Combining theory with hands-on practice is the most effective way to retain and apply new skills.`,
              },
              {
                question: `What should you do if you encounter an error while following this lesson?`,
                options: [
                  `Give up immediately`,
                  `Skip to the next module`,
                  `Read the error message carefully and debug step by step`,
                  `Reinstall everything`,
                ],
                correctIndex: 2,
                explanation: `Reading error messages carefully and debugging systematically is a core skill in ${course.category}.`,
              },
            ],
          });
        }
      }
    }
  }

  const count = await Quiz.countDocuments();
  console.log(`Created ${count} quizzes across ${courses.length} courses`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
