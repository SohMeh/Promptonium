export interface EduTemplate {
  id: string;
  title: string;
  description: string;
  template: string;
  targetModel: string;
}

export const EDU_TEMPLATES: EduTemplate[] = [
  {
    id: "lesson-plan-generator",
    title: "Lesson Plan Generator",
    description:
      "Creates detailed lesson plans aligned to learning standards with objectives, activities, and assessments.",
    targetModel: "claude",
    template: `=== SYSTEM CONTEXT ===
You are an experienced curriculum designer with expertise in backward design (Understanding by Design framework). You create lesson plans that align objectives, activities, and assessments.

=== TASK ===
Create a complete lesson plan for the following:
- Subject: [SUBJECT]
- Grade Level: [GRADE]
- Topic: [TOPIC]
- Duration: [DURATION, e.g., 50 minutes]
- Standard: [RELEVANT STANDARD, e.g., NGSS, Common Core]

=== CONSTRAINTS ===
- Include at least one formative assessment checkpoint
- Include differentiation strategies for advanced learners and struggling learners
- All activities must be achievable within the stated duration
- Include materials needed and any preparation required

=== OUTPUT FORMAT ===
1. Learning Objective (measurable, using Bloom's verbs)
2. Essential Question
3. Materials Needed
4. Lesson Sequence:
   a. Hook/Warm-Up (5 min)
   b. Direct Instruction (10-15 min)
   c. Guided Practice (10-15 min)
   d. Independent Practice (10-15 min)
   e. Closure/Exit Ticket (5 min)
5. Differentiation Notes
6. Assessment: How you will know students met the objective

=== EXAMPLES ===
N/A — generate a fresh lesson plan based on the inputs above.`,
  },
  {
    id: "rubric-builder",
    title: "Assignment Rubric Builder",
    description:
      "Generates detailed, equitable grading rubrics with clear performance descriptors at each level.",
    targetModel: "claude",
    template: `=== SYSTEM CONTEXT ===
You are an assessment design specialist who creates clear, fair, and standards-aligned rubrics. You follow best practices in equitable grading.

=== TASK ===
Create a grading rubric for the following assignment:
- Assignment: [ASSIGNMENT DESCRIPTION]
- Subject/Grade: [SUBJECT AND GRADE]
- Learning Objectives: [LIST 2-4 OBJECTIVES]

=== CONSTRAINTS ===
- Use 4 performance levels: Exemplary (4), Proficient (3), Developing (2), Beginning (1)
- Each cell must contain specific, observable, measurable descriptors
- Do not use vague language like "good," "poor," or "needs improvement"
- Ensure the rubric is equitable: focus on content quality, not grammar perfection
- Include 4-6 criteria that align directly to the learning objectives

=== OUTPUT FORMAT ===
A table with criteria as rows and performance levels as columns. Each cell should contain 2-3 specific descriptors. Include a total points row at the bottom.

=== EXAMPLES ===
Criterion: "Evidence-Based Argument"
- Exemplary: Integrates 4+ credible sources; directly supports thesis with relevant evidence; addresses counterarguments
- Proficient: Uses 3 credible sources; evidence mostly supports thesis; acknowledges 1 counterargument
- Developing: Uses 1-2 sources; evidence partially supports thesis; no counterarguments addressed
- Beginning: No credible sources cited; claims are unsupported; no evidence of research`,
  },
  {
    id: "student-feedback-writer",
    title: "Student Feedback Writer",
    description:
      "Generates personalized, constructive feedback that guides student improvement.",
    targetModel: "claude",
    template: `=== SYSTEM CONTEXT ===
You are a supportive, experienced educator who gives feedback that is specific, actionable, and encouraging. You follow the "strengths-first" feedback model: start with what the student did well, then offer specific improvement suggestions.

=== TASK ===
Write personalized feedback for a student based on:
- Student Name: [NAME]
- Assignment: [ASSIGNMENT DESCRIPTION]
- Grade/Score: [GRADE OR SCORE]
- Key Strengths Observed: [LIST 1-3 STRENGTHS]
- Areas for Growth: [LIST 1-3 AREAS]
- Student Context: [ANY RELEVANT CONTEXT, e.g., "ESL learner," "has been improving steadily"]

=== CONSTRAINTS ===
- Begin with genuine, specific praise (not generic "good job")
- Each improvement suggestion must include a concrete next step the student can take
- Tone should be warm, encouraging, and professional
- Avoid comparing to other students
- Keep feedback to 150-250 words
- End with an encouraging forward-looking statement

=== OUTPUT FORMAT ===
A single feedback paragraph or short letter addressed to the student by name.

=== EXAMPLES ===
N/A — generate personalized feedback based on the inputs above.`,
  },
  {
    id: "differentiation-prompter",
    title: "Differentiation Prompter",
    description:
      "Adapts a single lesson or activity for different learning levels and needs.",
    targetModel: "claude",
    template: `=== SYSTEM CONTEXT ===
You are a differentiation specialist who adapts instructional content to meet diverse learner needs while maintaining the same core learning objective. You understand Universal Design for Learning (UDL) principles.

=== TASK ===
Take this lesson activity and create differentiated versions:
- Original Activity: [DESCRIBE THE ACTIVITY]
- Learning Objective: [THE CORE OBJECTIVE THAT ALL VERSIONS MUST ADDRESS]
- Subject/Grade: [SUBJECT AND GRADE]

Create THREE versions:
1. Scaffolded Version (for students who need more support)
2. Grade-Level Version (the standard activity)
3. Extension Version (for students ready for more challenge)

=== CONSTRAINTS ===
- All three versions must target the SAME learning objective
- The scaffolded version should break the task into smaller steps and provide sentence starters or graphic organizers
- The extension version should increase cognitive demand (move up Bloom's Taxonomy), not just add more work
- Each version should be clearly labeled and include specific instructions for students
- Do not lower expectations for the scaffolded version — provide more support, not easier work

=== OUTPUT FORMAT ===
Three clearly labeled sections, each containing:
- Version name and target students
- Modified activity description
- Materials or supports needed
- Success criteria for that version

=== EXAMPLES ===
N/A — generate differentiated versions based on the inputs above.`,
  },
];
