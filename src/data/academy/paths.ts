import type { LearningPath, LessonModule } from "@/lib/types/lesson";

export const LEARNING_PATHS: LearningPath[] = [
  // ── Path 1: Prompt Foundations (beginner, 5 lessons) ──────────────────
  {
    id: "prompt-foundations",
    title: "Prompt Foundations",
    description:
      "Start here. Learn the core principles of prompt engineering — from writing clear instructions to structuring prompts for consistent, high-quality AI output.",
    difficulty: "beginner",
    isEduMode: false,
    lessons: [
      {
        id: "what-makes-a-good-prompt",
        pathId: "prompt-foundations",
        order: 1,
        title: "What Makes a Good Prompt",
        description:
          "Understand the anatomy of an effective prompt and why structure matters.",
        contentMarkdown: `## What Makes a Good Prompt

A prompt is the input you give to an AI model to get a desired output. While it might seem like you can just type a question and get a good answer, the quality of your output is directly tied to the quality of your input. This is the fundamental principle of prompt engineering: garbage in, garbage out — and conversely, clarity in, brilliance out.

## The Three Pillars of a Good Prompt

Every effective prompt rests on three pillars: **context**, **task**, and **output format**. Context tells the AI who it is and what situation it is operating in. The task gives it a clear, specific instruction about what to do. The output format describes what the response should look like — a list, a paragraph, a table, code, and so on. When all three are present, the AI has a much easier time producing exactly what you need.

## Why Vague Prompts Fail

Consider the prompt "Tell me about space." What does that even mean? Space travel? Outer space? Personal space? The AI has to guess, and guessing means inconsistent results. Now compare that with: "You are a science educator. Explain the concept of gravity in outer space to a curious 10-year-old, using simple analogies. Keep your answer under 150 words." The second prompt leaves almost nothing to chance.

## Context Sets the Stage

Context is often the most undervalued part of a prompt. By telling the AI what role to assume — "You are a patient math tutor" or "You are a senior software engineer reviewing code" — you anchor its behavior. Context can also include relevant background information, such as "The student has already learned addition and subtraction but has not yet encountered multiplication."

## Start Practicing

The best way to learn prompt engineering is by doing it. In the practice exercise below, you will write a prompt that asks an AI to explain photosynthesis to a 10-year-old. Focus on including all three pillars: context (who the AI is), task (what it should explain), and output format (how the answer should be structured).`,
        practice: {
          description:
            "Write a prompt asking an AI to explain photosynthesis to a 10-year-old. Your prompt should include context (a role for the AI), a clear task, and an output format specification.",
          targetModel: "claude",
          hints: [
            "Start by assigning a role — for example, 'You are a friendly science teacher for elementary school students.'",
            "Be explicit about the audience: mention the child's age and that you want simple language with no jargon.",
            "Specify the output format — should it be a short paragraph, a bulleted list, or an analogy-based explanation?",
          ],
          examplePrompt:
            "You are a friendly science teacher who specializes in making complex topics fun for kids. Explain how photosynthesis works to a 10-year-old student. Use a simple analogy (like a kitchen or a factory) to make it relatable. Keep your explanation under 100 words and end with a fun fact.",
        },
        checkpointThreshold: 65,
      },
      {
        id: "being-specific",
        pathId: "prompt-foundations",
        order: 2,
        title: "Being Specific",
        description:
          "Learn why precision in your instructions dramatically improves AI output quality.",
        contentMarkdown: `## Being Specific

One of the most common mistakes in prompt engineering is being too vague. Humans are remarkably good at inferring intent from context — if a colleague says "clean this up," you probably know what they mean. AI models, however, do not share your context. They interpret instructions literally, and vague instructions produce vague results.

## The Specificity Spectrum

Think of specificity as a spectrum. On one end, you have "Write something about dogs." On the other end, you have "Write a 200-word informational paragraph about the history of Labrador Retrievers as service dogs, aimed at a general adult audience, in a warm but factual tone." The second prompt is dramatically more specific, and the AI output will be dramatically better as a result.

## What to Specify

There are several dimensions you can make specific: the **topic** (what exactly to write about), the **length** (word count, number of items), the **audience** (who will read this), the **tone** (formal, casual, humorous), the **format** (paragraph, bullet points, table), and any **constraints** (things to avoid, requirements to include). The more of these you pin down, the more predictable and useful the output becomes.

## The Rewrite Test

A powerful exercise is to take a vague prompt and rewrite it to be specific. For every vague word — "good," "some," "nice," "interesting" — ask yourself: what do I actually mean? Replace "write a good email" with "write a professional, concise email of 3-4 sentences." Replace "tell me some facts" with "list 5 verified facts with sources."

## Practice Time

In the exercise below, you will be given a vague prompt and your job is to rewrite it to be as specific as possible. Think about every dimension of specificity and lock them down.`,
        practice: {
          description:
            "Rewrite this vague prompt to be specific: 'Write something about healthy eating.' Your rewrite should specify the topic precisely, the audience, tone, length, format, and at least one constraint.",
          targetModel: "claude",
          hints: [
            "Start by deciding: who is this for? A teenager? A busy parent? A fitness enthusiast? Naming the audience changes everything.",
            "Add concrete numbers: 'List 5 tips' is better than 'give some tips.' Specify word count or section count.",
            "Include at least one constraint, like 'Do not include any fad diet advice' or 'Focus only on plant-based options.'",
          ],
        },
        checkpointThreshold: 65,
      },
      {
        id: "tone-and-style-control",
        pathId: "prompt-foundations",
        order: 3,
        title: "Tone and Style Control",
        description:
          "Master the art of guiding the AI's voice, from formal reports to casual conversations.",
        contentMarkdown: `## Tone and Style Control

The same information can be communicated in wildly different ways depending on the tone and style. A medical explanation for a doctor reads nothing like the same explanation for a patient, which reads nothing like the same explanation for a child. Controlling tone and style is one of the most powerful levers in prompt engineering.

## Defining Tone vs. Style

**Tone** is the emotional quality of the writing — formal, casual, empathetic, authoritative, playful, urgent. **Style** is the structural and linguistic approach — short sentences vs. long ones, technical jargon vs. plain language, first person vs. third person, use of analogies, and so on. When you specify both tone and style, the AI can match your intent precisely.

## Techniques for Tone Control

There are several effective techniques. First, you can **name the tone directly**: "Write in a professional, empathetic tone." Second, you can **provide a persona**: "You are a warm, encouraging life coach." Third, you can **give a style reference**: "Write in the style of a New York Times opinion piece." Fourth, you can **show by example**: include a sample sentence that demonstrates the tone you want.

## Common Pitfalls

A frequent mistake is specifying a tone that conflicts with the task. Asking for a "fun, casual" medical diagnosis explanation might produce something that feels unprofessional and could mislead. Another pitfall is being inconsistent — asking for "formal" in the role but "casual" in the instructions. The AI will be confused and the output will be uneven.

## Your Turn

In the practice below, you will write the same task — explaining what a budget is — in two different tones. This will help you see how tone directives dramatically change the AI's output.`,
        practice: {
          description:
            "Write TWO prompts for the same task: explaining what a personal budget is and why it matters. Prompt A should be in a professional, corporate-training tone. Prompt B should be in a casual, friendly tone as if explaining to a college roommate. Each prompt should be a complete, standalone instruction.",
          targetModel: "claude",
          hints: [
            "For the professional tone, use words like 'financial planning,' 'allocate,' and 'fiscal responsibility.' Set the AI role as a corporate trainer.",
            "For the casual tone, use phrases like 'so basically,' 'here is the deal,' and 'trust me on this.' Set the AI role as a friend.",
            "Make sure both prompts specify the same core content — just wrapped in different tones. This shows you understand tone as a layer on top of content.",
          ],
        },
        checkpointThreshold: 65,
      },
      {
        id: "structured-prompting",
        pathId: "prompt-foundations",
        order: 4,
        title: "Structured Prompting",
        description:
          "Learn to organize prompts into clear sections for maximum consistency and quality.",
        contentMarkdown: `## Structured Prompting

As your prompts become more complex, free-form paragraphs become harder to manage. Structured prompting solves this by organizing your prompt into clearly labeled sections. This is not just about aesthetics — structure helps the AI parse your intent, reduces ambiguity, and makes your prompts reusable and editable.

## The Five-Section Framework

A robust structured prompt has five sections. **System Context** defines who the AI is and what background it needs. **Task** states exactly what it should do. **Constraints** list rules, limits, and things to avoid. **Output Format** describes the expected shape of the response. **Examples** show what good output looks like. Not every prompt needs all five, but complex tasks benefit enormously from this framework.

## Why Structure Works

AI models process prompts sequentially, and clear section headers act as signposts. When the AI encounters "=== CONSTRAINTS ===" followed by a list of rules, it knows to treat those as hard boundaries rather than suggestions. Without structure, constraints can get lost in a wall of text and the AI may ignore them.

## Section Headers and Formatting

Different models respond well to different formatting. Claude works exceptionally well with XML-style tags or triple-equals headers. GPT models respond well to markdown headers (## Section). Gemini tends to prefer clean bullet points and short paragraphs. Regardless of format, the key principle is the same: clear, consistent labels that separate concerns.

## Build Your Own

In the practice exercise, you will write a complete structured prompt with all five sections. This is your chance to put together everything you have learned so far — context, specificity, tone, and now structure.`,
        practice: {
          description:
            "Write a fully structured prompt with all 5 sections (System Context, Task, Constraints, Output Format, Examples) that asks an AI to write a product description for a new eco-friendly water bottle. The description should be aimed at environmentally conscious millennials.",
          targetModel: "claude",
          hints: [
            "Use clear section headers like '=== SYSTEM CONTEXT ===' to separate each part. Put the AI role and background in the System Context section.",
            "In the Constraints section, include at least 2-3 specific rules, such as 'Do not use greenwashing language' or 'Keep under 150 words.'",
            "In the Examples section, provide a short sample of what a good product description opening might look like, so the AI has a reference point.",
          ],
          examplePrompt: `=== SYSTEM CONTEXT ===
You are a copywriter specializing in sustainable consumer products. You write compelling, honest product descriptions that resonate with environmentally conscious millennials.

=== TASK ===
Write a product description for the "EcoFlow" reusable water bottle made from 100% recycled ocean plastic.

=== CONSTRAINTS ===
- Keep the description between 100-150 words
- Do not use greenwashing buzzwords like "revolutionary" or "game-changing"
- Include at least one specific environmental impact statistic
- Use second-person ("you") to address the reader directly

=== OUTPUT FORMAT ===
A single paragraph with a compelling opening hook, 2-3 sentences of product details, and a closing call-to-action.

=== EXAMPLES ===
Good opening: "Every sip tells a story — one of ocean plastic rescued, reimagined, and returned to purpose."
Bad opening: "This amazing revolutionary bottle will change the world!"`,
        },
        checkpointThreshold: 70,
      },
      {
        id: "iteration-and-refinement",
        pathId: "prompt-foundations",
        order: 5,
        title: "Iteration and Refinement",
        description:
          "Master the edit-evaluate loop to continuously improve your prompts.",
        contentMarkdown: `## Iteration and Refinement

No one writes a perfect prompt on the first try. The best prompt engineers treat their work as an iterative process: write, evaluate, identify weaknesses, revise, and evaluate again. This edit-evaluate loop is the single most important habit you can develop.

## The Edit-Evaluate Loop

The loop has four steps. **Write** your initial prompt based on your best understanding of the task. **Evaluate** the output — does it match what you wanted? Where does it fall short? **Identify** the specific weaknesses: is the output too long, off-topic, missing key details, wrong tone? **Revise** the prompt to address those weaknesses, then evaluate again. Each cycle should produce a measurably better result.

## Common Weaknesses to Look For

When evaluating AI output, look for these common issues: **hallucination** (the AI made up facts), **drift** (the response starts on-topic but wanders), **format violations** (you asked for a list but got paragraphs), **tone mismatches** (you wanted formal but got casual), and **incompleteness** (key requirements were missed). Each of these points back to a specific part of your prompt that needs strengthening.

## Revision Strategies

For hallucination, add constraints like "Only use verified information" or "If unsure, say so." For drift, add a clear scope statement: "Focus exclusively on X; do not discuss Y." For format violations, add explicit format examples. For tone mismatches, strengthen your tone directives or add a style example. For incompleteness, add a checklist of required elements.

## Practice Iteration

In the exercise below, you will be given a weak prompt. Your job is to identify its problems and write an improved version. Think about what is missing, what is vague, and what could confuse the AI.`,
        practice: {
          description:
            "Here is a weak prompt: 'Write a blog post about remote work. Make it good and informative. Include some tips.' Identify at least 3 specific problems with this prompt, then write an improved version that addresses all of them. Your improved prompt should be a complete, structured instruction.",
          targetModel: "claude",
          hints: [
            "The original prompt lacks specificity (what aspect of remote work?), has no audience defined, no tone specified, no length constraint, and 'make it good' is meaningless to an AI.",
            "Your improved version should specify: the exact topic within remote work, the target audience, the desired tone, the length, the format, and any constraints.",
            "Consider adding structure (sections) to your improved prompt and specifying the output format precisely — how many tips, how long each should be, etc.",
          ],
        },
        checkpointThreshold: 70,
      },
    ],
  },

  // ── Path 2: Advanced Techniques (intermediate, 4 lessons) ─────────────
  {
    id: "advanced-techniques",
    title: "Advanced Techniques",
    description:
      "Level up with powerful prompt patterns used by professionals — few-shot learning, chain-of-thought reasoning, personas, and robust edge-case handling.",
    difficulty: "intermediate",
    isEduMode: false,
    lessons: [
      {
        id: "few-shot-prompting",
        pathId: "advanced-techniques",
        order: 1,
        title: "Few-Shot Prompting",
        description:
          "Teach the AI by example — provide input-output pairs to guide behavior.",
        contentMarkdown: `## Few-Shot Prompting

Few-shot prompting is one of the most powerful techniques in prompt engineering. Instead of describing what you want in abstract terms, you show the AI concrete examples of input-output pairs. The AI then generalizes from these examples to handle new inputs. This technique is especially effective for classification, formatting, and any task where the pattern is easier to show than to explain.

## How Few-Shot Works

The basic structure is simple: you provide 2-5 examples of the pattern you want, then give the AI a new input and ask it to continue the pattern. For instance, if you want the AI to classify customer feedback as positive, negative, or neutral, you show it three labeled examples and then give it a new piece of feedback to classify. The AI picks up on the pattern and applies it.

## Choosing Good Examples

The quality of your examples matters enormously. Good few-shot examples are **representative** (they cover the range of cases the AI will encounter), **diverse** (they are not all the same type), and **clear** (the correct answer is unambiguous). If all your examples are easy cases, the AI will struggle with edge cases. If your examples are inconsistent, the AI will be confused.

## Zero-Shot vs. Few-Shot vs. Many-Shot

Zero-shot means giving no examples — just instructions. This works for simple, well-defined tasks. Few-shot (2-5 examples) works for tasks where the pattern is complex or subtle. Many-shot (10+ examples) can be useful but has diminishing returns and uses up context window. For most tasks, 3-5 well-chosen examples hit the sweet spot.

## Time to Practice

In the exercise below, you will write a few-shot prompt for a text classification task. Your goal is to provide clear examples that teach the AI the classification scheme, then set it up to classify new text correctly.`,
        practice: {
          description:
            "Write a few-shot prompt that teaches an AI to classify customer support messages into one of three categories: 'billing', 'technical', or 'general'. Provide at least 3 example messages with their correct categories, then include a new message for the AI to classify.",
          targetModel: "claude",
          hints: [
            "Start with a clear system instruction: 'You are a customer support classifier. Categorize each message as billing, technical, or general.'",
            "Make your examples diverse — include one clear billing issue, one clear technical issue, and one general inquiry. Show the exact format you want the classification in.",
            "End with a new, unlabeled message and the classification prompt. Consider choosing a slightly ambiguous message to test whether your examples were clear enough.",
          ],
          examplePrompt: `You are a customer support message classifier. For each message, respond with exactly one category: "billing", "technical", or "general".

Message: "I was charged twice for my subscription this month and need a refund."
Category: billing

Message: "The app keeps crashing whenever I try to upload a photo larger than 5MB."
Category: technical

Message: "What are your business hours and do you have a phone number I can call?"
Category: general

Message: "I upgraded to the Pro plan but my account still shows the Basic features."
Category:`,
        },
        checkpointThreshold: 70,
      },
      {
        id: "chain-of-thought",
        pathId: "advanced-techniques",
        order: 2,
        title: "Chain of Thought",
        description:
          "Guide the AI through step-by-step reasoning for complex problems.",
        contentMarkdown: `## Chain of Thought Prompting

Chain of Thought (CoT) prompting is a technique that dramatically improves AI performance on reasoning tasks. Instead of asking for a direct answer, you instruct the AI to think through the problem step by step before reaching a conclusion. Research has shown that this simple change can improve accuracy on math, logic, and multi-step reasoning tasks by 20-40%.

## Why Step-by-Step Works

AI models generate text one token at a time. When you ask for a direct answer, the model has to "compress" all its reasoning into the first few tokens of its response. When you ask it to think step by step, each intermediate step provides context for the next one, allowing the model to build up to the correct answer gradually. It is like the difference between doing mental math and writing out your work.

## Explicit vs. Implicit CoT

There are two approaches. **Explicit CoT** means you literally say "Think through this step by step" or "Show your reasoning before giving your final answer." **Implicit CoT** means you demonstrate step-by-step reasoning in your examples (few-shot CoT). Both work, but explicit CoT is simpler and often just as effective. You can also combine them for maximum impact.

## When to Use Chain of Thought

CoT is most valuable for tasks that involve multiple steps of reasoning: math word problems, logical deductions, code debugging, planning and scheduling, comparative analysis, and causal reasoning. For simple factual recall or creative writing, CoT is less necessary and can actually slow things down.

## Practice with CoT

In the exercise below, you will write a CoT prompt for a math word problem. Your goal is to structure the prompt so the AI shows its work at every step before arriving at the final answer.`,
        practice: {
          description:
            "Write a chain-of-thought prompt that asks an AI to solve this word problem: 'A bakery makes 120 cupcakes per hour. They received orders for 850 cupcakes due by 5 PM. It is currently 9 AM. They also need 30 minutes to package every 100 cupcakes. Will they finish on time? How many extra cupcakes could they make if they have time left over?' Your prompt should instruct the AI to reason through each step explicitly.",
          targetModel: "claude",
          hints: [
            "Include an explicit instruction like 'Think through this problem step by step. Show your work for each calculation before moving to the next.'",
            "Consider breaking the problem into sub-questions in your prompt: first calculate production time, then packaging time, then compare to available time.",
            "Ask the AI to state its final answer clearly after the reasoning, separated from the work — for example, 'After your step-by-step analysis, provide a clear summary answer.'",
          ],
        },
        checkpointThreshold: 70,
      },
      {
        id: "role-playing-and-personas",
        pathId: "advanced-techniques",
        order: 3,
        title: "Role-Playing and Personas",
        description:
          "Unlock powerful AI behavior by crafting detailed persona prompts.",
        contentMarkdown: `## Role-Playing and Personas

Persona-based prompting goes beyond simple role-setting ("You are a teacher") into crafting detailed character profiles that shape every aspect of the AI's behavior. A well-crafted persona prompt can make the AI adopt specific expertise, communication styles, biases, perspectives, and even personality traits. This technique is invaluable for creating consistent AI assistants, tutoring systems, and creative applications.

## Anatomy of a Great Persona

A detailed persona has several layers. **Identity** establishes who the character is (name, role, background). **Expertise** defines what they know and how deeply. **Communication style** shapes how they express themselves — sentence length, vocabulary level, use of humor or formality. **Behavioral rules** set boundaries on what they will and will not do. **Perspective** gives them a point of view that colors their responses.

## The Depth Principle

The more detail you provide in a persona, the more consistent the AI's behavior becomes. A shallow persona like "You are a doctor" gives the AI very little to work with. A deep persona like "You are Dr. Sarah Chen, a pediatrician with 15 years of experience who believes strongly in explaining medical concepts to parents using everyday analogies, always validates concerns before offering advice, and never uses medical jargon without immediately defining it" produces remarkably consistent, character-driven responses.

## Multi-Turn Persona Stability

One challenge with persona prompts is maintaining character across a long conversation. The AI may "forget" or drift from its persona over time. To combat this, reinforce key persona traits at strategic points, use the system prompt for the core persona, and include behavioral "guardrails" that keep the AI on character even when the conversation goes in unexpected directions.

## Create Your Own Persona

In the practice below, you will design a detailed persona prompt. The goal is not just to assign a role but to craft a complete character that will behave consistently across a range of questions.`,
        practice: {
          description:
            "Create a detailed persona prompt for an AI that acts as a seasoned travel advisor named 'Marco' who specializes in budget-friendly European travel. Your persona should include: identity and background, specific expertise areas, communication style, at least 3 behavioral rules, and a unique perspective or philosophy about travel.",
          targetModel: "claude",
          hints: [
            "Give Marco a specific background — years of experience, countries lived in, a personal travel philosophy. This grounds the persona and makes responses more authentic.",
            "Define communication style precisely: Does Marco use humor? Short punchy sentences or long descriptions? Does he reference personal experiences? Does he use travel slang?",
            "Include behavioral rules like 'Always suggest at least one off-the-beaten-path alternative' or 'Never recommend a hotel without mentioning a nearby budget hostel option.' These keep the persona consistent.",
          ],
        },
        checkpointThreshold: 70,
      },
      {
        id: "handling-edge-cases",
        pathId: "advanced-techniques",
        order: 4,
        title: "Handling Edge Cases",
        description:
          "Design prompts that handle unexpected inputs gracefully and produce robust, reliable output.",
        contentMarkdown: `## Handling Edge Cases

A prompt that works perfectly for typical inputs but breaks on unusual ones is not a good prompt. Robust prompt design means anticipating edge cases — unexpected inputs, ambiguous requests, missing information, adversarial attempts — and building handling for them directly into your prompt. This is what separates amateur prompts from production-quality ones.

## Common Edge Cases

There are several categories of edge cases to consider. **Missing information**: what if the user does not provide a required detail? **Ambiguous input**: what if the request could be interpreted multiple ways? **Out-of-scope requests**: what if the user asks for something the AI should not do? **Invalid format**: what if the input does not match expected structure? **Adversarial input**: what if someone tries to trick the AI into bad behavior?

## Defensive Prompting Strategies

For each edge case category, there are proven strategies. For missing information, add instructions like "If the user does not specify X, ask them before proceeding" or "If X is not provided, assume Y and state this assumption." For ambiguity, use "If the request is ambiguous, list the possible interpretations and ask for clarification." For out-of-scope requests, use "If asked about topics outside of X, politely redirect to your area of expertise."

## The Robustness Checklist

Before finalizing any important prompt, run through this checklist: (1) What happens with minimal input? (2) What happens with very long input? (3) What happens with contradictory instructions? (4) What happens if required fields are missing? (5) What happens if the user tries to override the system prompt? If your prompt handles all five gracefully, it is production-ready.

## Strengthen a Prompt

In the exercise below, you will take a basic prompt and add comprehensive edge-case handling to make it robust and reliable.`,
        practice: {
          description:
            "Here is a basic prompt: 'You are a recipe assistant. When the user gives you ingredients, suggest a recipe.' Add edge-case handling for: (1) when the user provides no ingredients, (2) when they include allergens or dietary restrictions, (3) when they list ingredients that do not go together, and (4) when they ask for something non-recipe-related. Write the complete, improved prompt.",
          targetModel: "claude",
          hints: [
            "For each edge case, write an explicit 'If... then...' instruction. For example: 'If the user provides fewer than 2 ingredients, ask them to add more and suggest common pantry staples they might have.'",
            "For dietary restrictions, add a rule like: 'Before suggesting a recipe, check if any listed ingredients conflict with common allergens. If the user mentions allergies or dietary restrictions, filter all suggestions accordingly.'",
            "Include a graceful out-of-scope handler: 'If the user asks a question unrelated to cooking or recipes, acknowledge their question and gently redirect: I specialize in recipes — would you like help with a meal idea?'",
          ],
        },
        checkpointThreshold: 75,
      },
    ],
  },

  // ── Path 3: Educator's Toolkit (advanced, 3 lessons, eduMode) ────────
  {
    id: "educators-toolkit",
    title: "Educator's Toolkit",
    description:
      "Advanced prompt engineering techniques specifically designed for educators — align prompts to Bloom's Taxonomy, scaffold learning progressions, and design AI-powered assessments.",
    difficulty: "advanced",
    isEduMode: true,
    lessons: [
      {
        id: "blooms-taxonomy-in-prompts",
        pathId: "educators-toolkit",
        order: 1,
        title: "Bloom's Taxonomy in Prompts",
        description:
          "Map cognitive levels to prompt structures for deeper learning outcomes.",
        contentMarkdown: `## Bloom's Taxonomy in Prompts

Bloom's Taxonomy is a framework that classifies learning objectives into six cognitive levels, from simple recall to complex creation. When combined with prompt engineering, it becomes a powerful tool for designing AI interactions that target specific levels of student thinking. Understanding this connection transforms you from someone who uses AI for basic Q&A into an educator who uses AI to develop higher-order thinking skills.

## The Six Levels and Their Prompt Patterns

**Remember** (recall facts): "List the three branches of the US government." **Understand** (explain concepts): "Explain in your own words why the separation of powers matters." **Apply** (use in new situations): "Given this scenario of a new law being proposed, trace its path through all three branches." **Analyze** (break into parts): "Compare and contrast how the executive and legislative branches check each other's power." **Evaluate** (make judgments): "Assess whether the current balance of power between branches is effective, citing evidence." **Create** (produce new work): "Design an alternative system of government that addresses the weaknesses you identified."

## Designing Level-Appropriate Prompts

Each Bloom's level corresponds to specific verbs and prompt structures. Lower levels (Remember, Understand) use verbs like list, define, describe, explain, summarize. Middle levels (Apply, Analyze) use verbs like apply, solve, compare, categorize, examine. Upper levels (Evaluate, Create) use verbs like argue, justify, design, compose, hypothesize. By intentionally choosing your verbs, you control the cognitive demand of the AI-generated exercise.

## Scaffolding Across Levels

The real power comes from designing prompt sequences that move students up through the levels. Start with a Remember-level prompt to activate prior knowledge, then an Understand prompt to deepen comprehension, then progressively move to Apply, Analyze, Evaluate, and Create. This scaffolded approach ensures students build understanding before tackling complex tasks.

## Practice: Write for Every Level

In the exercise below, you will write prompts targeting each of the six Bloom's levels for a single topic. This will demonstrate your ability to control cognitive demand through prompt engineering.`,
        practice: {
          description:
            "Choose a subject area you are comfortable with (e.g., biology, history, literature). Write six prompts — one for each level of Bloom's Taxonomy (Remember, Understand, Apply, Analyze, Evaluate, Create) — all on the same topic. Each prompt should clearly target its cognitive level and include an appropriate verb.",
          targetModel: "claude",
          hints: [
            "Start by picking a specific topic within your subject (e.g., 'the water cycle' in biology or 'the Civil Rights Movement' in history). Then write all six levels around that single topic.",
            "Use Bloom's-specific verbs: Remember=list/name/identify, Understand=explain/describe/summarize, Apply=demonstrate/solve/use, Analyze=compare/examine/categorize, Evaluate=judge/argue/justify, Create=design/compose/propose.",
            "Make sure each prompt increases in cognitive complexity. A good test: could a student answer the higher-level prompt without doing the work of the lower levels? If yes, it might not truly be higher-order.",
          ],
        },
        checkpointThreshold: 70,
      },
      {
        id: "scaffolding-with-ai",
        pathId: "educators-toolkit",
        order: 2,
        title: "Scaffolding with AI",
        description:
          "Build progressive prompt sequences that guide students from simple to complex understanding.",
        contentMarkdown: `## Scaffolding with AI

Scaffolding is the educational practice of providing temporary support structures that help students reach levels of understanding they could not achieve on their own. When applied to AI-assisted learning, scaffolding means designing prompt sequences that progressively build complexity, provide decreasing levels of support, and ultimately lead students to independent mastery.

## The Scaffolding Principle

Think of scaffolding like building a house — you need the foundation before the walls, and the walls before the roof. In AI-assisted learning, the "foundation" is a prompt that provides heavy support (examples, partial answers, step-by-step guidance). The "walls" reduce that support (hints instead of answers, open-ended instead of multiple choice). The "roof" removes support entirely (the student works independently with minimal AI guidance).

## Designing a Scaffolded Sequence

A well-scaffolded AI prompt sequence has three to five stages. Stage 1 (High Support): The AI models the thinking process — "Here is how you would approach this problem: Step 1..." Stage 2 (Guided Practice): The AI provides the framework but the student fills in key parts — "Using the steps above, now try this similar problem. I will check your work at each step." Stage 3 (Independent Practice): The AI poses the problem and only helps if asked — "Solve this problem on your own. If you get stuck, describe where you are and I will give you a hint."

## Adaptive Scaffolding

The most effective scaffolding adapts to the student's performance. You can build this into your prompts: "If the student answers correctly, increase the difficulty and reduce the hints. If the student struggles, break the current problem into smaller sub-problems and provide more guidance." This creates a responsive learning experience that meets each student where they are.

## Build a Scaffolded Sequence

In the practice below, you will design a complete scaffolded prompt sequence that moves a student from supported learning to independence on a specific topic.`,
        practice: {
          description:
            "Design a 3-stage scaffolded prompt sequence for teaching students how to write a persuasive essay thesis statement. Stage 1 should provide heavy support with examples and step-by-step guidance. Stage 2 should provide a framework with partial support. Stage 3 should challenge the student to work independently with minimal help. Each stage should be a complete prompt.",
          targetModel: "claude",
          hints: [
            "In Stage 1, have the AI demonstrate the thesis-writing process: show examples of strong vs. weak thesis statements, explain the formula (claim + reasons), and walk through creating one together.",
            "In Stage 2, provide a topic and a thesis template with blanks: 'Although [counterargument], [your position] because [reason 1] and [reason 2].' Have the AI give feedback on the student's attempt.",
            "In Stage 3, give only the assignment topic. The AI should not provide examples or templates — it should only respond with feedback after the student submits their thesis, asking questions that guide revision rather than giving answers.",
          ],
        },
        checkpointThreshold: 70,
      },
      {
        id: "assessment-prompt-design",
        pathId: "educators-toolkit",
        order: 3,
        title: "Assessment Prompt Design",
        description:
          "Create AI prompts that generate fair, comprehensive rubrics and evaluation criteria.",
        contentMarkdown: `## Assessment Prompt Design

One of the most time-consuming tasks in education is creating fair, comprehensive assessments and rubrics. AI can dramatically accelerate this process — but only if your prompts are designed with assessment principles in mind. Poorly prompted rubric generation leads to vague criteria, inconsistent scoring, and assessments that do not align with learning objectives.

## Principles of Good Assessment Prompts

Effective assessment prompts embed three key principles. **Alignment**: the rubric criteria must map directly to the learning objectives. If the objective is "Students will analyze primary sources," the rubric must assess analysis, not just summarization. **Clarity**: each criterion must be specific enough that two different graders would give the same score. **Fairness**: the rubric must account for different valid approaches and not penalize students for style differences that do not affect learning.

## Rubric Generation Prompts

When prompting AI to generate rubrics, include these elements: the specific assignment description, the learning objectives being assessed, the number of scoring levels you want (typically 4: exemplary, proficient, developing, beginning), the number of criteria (typically 3-6), and any constraints on language or format. The more specific your input, the more useful the rubric.

## Beyond Simple Rubrics

Advanced assessment prompts can generate differentiated assessments (same learning objective, different difficulty levels), self-assessment checklists for students, peer review guidelines, formative assessment questions that check understanding at specific points in a lesson, and even multi-stage portfolio assessment frameworks. The key is being explicit about what type of assessment tool you need and how it will be used.

## Create an Assessment Prompt

In the exercise below, you will write a prompt that generates a comprehensive grading rubric. Your prompt should produce a rubric that is specific, aligned, and fair.`,
        practice: {
          description:
            "Write a prompt that asks an AI to generate a 4-level grading rubric (Exemplary, Proficient, Developing, Beginning) for a high school research paper. The rubric should have at least 4 criteria. Your prompt must specify the learning objectives, the assignment requirements, and any constraints about the rubric format (e.g., specific descriptors for each level, point values).",
          targetModel: "claude",
          hints: [
            "Start by clearly stating the learning objectives the research paper is meant to assess — for example, 'evaluate source credibility,' 'construct an evidence-based argument,' 'synthesize multiple perspectives.'",
            "Specify that each rubric cell should contain observable, measurable descriptors — not vague language like 'good' or 'needs improvement.' Ask for specific indicators: 'Uses 3+ credible sources' vs. 'Uses good sources.'",
            "Include a constraint that the rubric should be equitable — for instance, 'Do not penalize for writing style preferences that do not affect the quality of the argument' and 'Account for multilingual learners by focusing on content quality over grammatical perfection.'",
          ],
        },
        checkpointThreshold: 70,
      },
    ],
  },
];

export function getPathById(id: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.id === id);
}

export function getLessonById(
  pathId: string,
  lessonId: string
): LessonModule | undefined {
  const path = getPathById(pathId);
  if (!path) return undefined;
  return path.lessons.find((l) => l.id === lessonId);
}
