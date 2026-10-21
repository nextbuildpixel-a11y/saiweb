package com.aiinterview.coach.ai;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Pattern;

@Component
public class AnswerEvaluator {

    public enum EvaluationCategory {
        EMPTY_OR_UNANSWERED,
        DONT_KNOW,
        GIBBERISH,
        UNRELATED,
        VALID_RESPONSE
    }

    public static class EvaluationCheckResult {
        private final EvaluationCategory category;
        private final boolean isZeroScore;
        private final String diagnosticReason;
        private final List<String> weaknesses;
        private final List<String> suggestions;

        public EvaluationCheckResult(EvaluationCategory category, boolean isZeroScore, String diagnosticReason, List<String> weaknesses, List<String> suggestions) {
            this.category = category;
            this.isZeroScore = isZeroScore;
            this.diagnosticReason = diagnosticReason;
            this.weaknesses = weaknesses;
            this.suggestions = suggestions;
        }

        public EvaluationCategory getCategory() { return category; }
        public boolean isZeroScore() { return isZeroScore; }
        public String getDiagnosticReason() { return diagnosticReason; }
        public List<String> getWeaknesses() { return weaknesses; }
        public List<String> getSuggestions() { return suggestions; }
    }

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
        "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
        "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
        "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing",
        "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
        "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
        "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is",
        "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
        "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves",
        "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
        "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then",
        "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those",
        "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're",
        "we've", "were", "weren't", "what", "what's", "whatever", "when", "when's", "where", "where's", "which",
        "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd",
        "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
        "explain", "describe", "discuss", "tell", "briefly", "please", "difference", "differences", "give", "example", "examples"
    ));

    private static final List<String> DONT_KNOW_PHRASES = Arrays.asList(
        "dont know", "don't know", "do not know", "didnt know", "didn't know",
        "idk", "no idea", "no clue", "have no idea", "i have no idea",
        "have no clue", "i have no clue", "not sure", "i am not sure", "im not sure",
        "i'm not sure", "cannot answer", "cant answer", "can't answer", "unable to answer",
        "dunno", "dont remember", "don't remember", "forgot", "i forgot", "cant recall",
        "can't recall", "cannot recall", "havent learned", "haven't learned",
        "havent studied", "haven't studied", "not aware", "not familiar",
        "no knowledge", "zero knowledge", "no answer", "no idea sir", "dont know sir",
        "i do not have any knowledge", "i don't have any knowledge", "dont have any idea"
    );

    private static final Set<String> EXPLICIT_SKIP_OR_EMPTY_TOKENS = new HashSet<>(Arrays.asList(
        "skip", "skipped", "skip question", "pass", "passed", "pass question",
        "nothing", "none", "na", "n/a", "nil", "blank", "unanswered", "next", "next question",
        "no comments", "no comment", "no answer provided", "no response recorded",
        "no voice response recorded", "no video answer recorded", "unanswered question",
        "no answer", "no response"
    ));

    private static final List<String> CHITCHAT_OR_OFFTOPIC_PATTERNS = Arrays.asList(
        "how are you", "who are you", "what is your name", "tell me a joke",
        "what time is it", "sing a song", "good morning", "good evening",
        "hello how are you", "hi how are you", "play cricket", "play football",
        "eating pizza", "eating burger", "eat pizza", "eat burger", "like pizza", "like cricket",
        "my favorite movie", "watched a movie", "i want to sleep", "sleep now",
        "listening to music", "buy groceries", "sunny day", "rainy day", "beautiful day",
        "weather is nice", "weather is good", "i love playing games", "today is a good day"
    );

    // Common domain technical terms across Java, CS, DBMS, OS, Web, DSA
    private static final Set<String> COMMON_TECH_TERMS = new HashSet<>(Arrays.asList(
        "java", "jvm", "jdk", "jre", "hashmap", "concurrenthashmap", "hashtable", "treemap", "map", "set", "list",
        "array", "arraylist", "linkedlist", "stack", "queue", "deque", "tree", "binary", "heap", "graph",
        "lock", "locking", "synchronized", "synchronization", "cas", "compare", "swap", "volatile", "atomic",
        "thread", "threads", "concurrency", "multithreading", "parallel", "process", "context", "switch",
        "class", "object", "interface", "abstract", "inheritance", "polymorphism", "encapsulation", "overloading", "overriding",
        "database", "dbms", "sql", "table", "index", "b-tree", "btree", "query", "queries", "join", "inner", "left", "right",
        "acid", "atomicity", "consistency", "isolation", "durability", "transaction", "commit", "rollback",
        "memory", "heap", "metaspace", "garbage", "collection", "collector", "young", "generation",
        "spring", "boot", "autowired", "dependency", "injection", "ioc", "bean", "controller", "service", "repository",
        "jwt", "token", "stateless", "authentication", "authorization", "bearer", "security", "bcrypt", "hash",
        "http", "rest", "api", "endpoint", "get", "post", "put", "delete", "status", "idempotent", "json",
        "complexity", "time", "space", "o(1)", "o(n)", "o(log", "linear", "constant", "logarithmic", "algorithm",
        "star", "situation", "task", "action", "result", "outcome", "metric", "project", "problem", "solution"
    ));

    public EvaluationCheckResult checkResponse(String questionText, String studentAnswer, String expectedTopics) {
        // 1. Check for empty, null, or whitespace only
        if (studentAnswer == null || studentAnswer.trim().isEmpty()) {
            return new EvaluationCheckResult(
                EvaluationCategory.EMPTY_OR_UNANSWERED,
                true,
                "No answer was provided (empty response).",
                Collections.singletonList("Answer was empty or not submitted. Zero credit awarded."),
                Arrays.asList(
                    "Attempt to answer the question or formulate key terms related to the question prompt.",
                    "Review foundational concepts in the placement curriculum before proceeding."
                )
            );
        }

        String trimmed = studentAnswer.trim();
        String normalized = trimmed.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();

        // 2. Check for explicit skip or empty placeholder tokens
        if (normalized.isEmpty() || EXPLICIT_SKIP_OR_EMPTY_TOKENS.contains(normalized)) {
            return new EvaluationCheckResult(
                EvaluationCategory.EMPTY_OR_UNANSWERED,
                true,
                "No answer was provided (skipped or unpopulated).",
                Collections.singletonList("Question was skipped or left unanswered. 0% score assigned."),
                Collections.singletonList("Study this specific topic in the Weak Area Practice module to prepare for real interviews.")
            );
        }

        // Very short nonsensical input (< 4 characters)
        if (normalized.length() <= 3 && !isNumericAnswer(normalized)) {
            return new EvaluationCheckResult(
                EvaluationCategory.EMPTY_OR_UNANSWERED,
                true,
                "The response is too brief to constitute an answer.",
                Collections.singletonList("Submitted response was fewer than 4 characters and contained no answer content."),
                Collections.singletonList("Provide a complete explanation detailing core technical definitions and mechanics.")
            );
        }

        // 3. Check for "I don't know" phrases
        for (String phrase : DONT_KNOW_PHRASES) {
            if (normalized.equals(phrase) || normalized.startsWith(phrase + " ") || normalized.endsWith(" " + phrase) || normalized.contains(" " + phrase + " ")) {
                return new EvaluationCheckResult(
                    EvaluationCategory.DONT_KNOW,
                    true,
                    "Candidate stated they do not know the answer ('" + phrase + "').",
                    Collections.singletonList("Candidate explicitly stated lack of knowledge ('" + phrase + "'). 0% score awarded."),
                    Arrays.asList(
                        "Study the core principles, syntax, and trade-offs of this topic.",
                        "Structure technical responses using: Concept Definition -> Underlying Mechanism -> Real-World Example."
                    )
                );
            }
        }

        // If normalized contains "dont know", "don't know", "idk", "no idea", "not sure" and doesn't provide technical depth
        if (normalized.contains("dont know") || normalized.contains("idk") || normalized.contains("no idea") || normalized.contains("not sure")) {
            int matchCount = countContentMatches(questionText, normalized, expectedTopics);
            if (matchCount < 2) {
                return new EvaluationCheckResult(
                    EvaluationCategory.DONT_KNOW,
                    true,
                    "Candidate indicated uncertainty or lack of knowledge.",
                    Collections.singletonList("Candidate response expresses lack of knowledge without substantial technical explanation."),
                    Collections.singletonList("Review the technical specifications for this question in your preparation plan.")
                );
            }
        }

        // 4. Check for gibberish / spam
        if (isGibberish(normalized)) {
            return new EvaluationCheckResult(
                EvaluationCategory.GIBBERISH,
                true,
                "The response contains gibberish or arbitrary keyboard input.",
                Collections.singletonList("Response contains non-word or arbitrary text without technical meaning. 0% score awarded."),
                Collections.singletonList("Provide meaningful, coherent technical explanations in placement interviews.")
            );
        }

        // 5. Check for off-topic chitchat
        for (String chitchat : CHITCHAT_OR_OFFTOPIC_PATTERNS) {
            if (normalized.contains(chitchat)) {
                int matchCount = countContentMatches(questionText, normalized, expectedTopics);
                if (matchCount == 0) {
                    return new EvaluationCheckResult(
                        EvaluationCategory.UNRELATED,
                        true,
                        "The response is off-topic conversational text.",
                        Collections.singletonList("Submitted answer is conversational or personal chat and does not address the technical question. 0% score awarded."),
                        Collections.singletonList("Confine your answers strictly to the technical question prompt.")
                    );
                }
            }
        }

        // 6. Check for topic relevance (zero match with question or domain concepts)
        int relevanceMatches = countContentMatches(questionText, normalized, expectedTopics);
        if (relevanceMatches == 0) {
            return new EvaluationCheckResult(
                EvaluationCategory.UNRELATED,
                true,
                "The response is completely unrelated to the interview question topic.",
                Collections.singletonList("The response shares zero relevance with the question asked. 0% score awarded for off-topic content."),
                Arrays.asList(
                    "Directly address the question asked: \"" + truncate(questionText, 80) + "\".",
                    "Do not provide unrelated or evasive text in placement interview rounds."
                )
            );
        }

        // Response passed basic relevance and knowledge checks
        return new EvaluationCheckResult(EvaluationCategory.VALID_RESPONSE, false, null, Collections.emptyList(), Collections.emptyList());
    }

    public Map<String, Object> buildZeroEvaluationMap(EvaluationCheckResult checkResult) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("accuracyScore", 0);
        map.put("overallScore", 0);
        map.put("technicalScore", 0);
        map.put("relevanceScore", 0);
        map.put("communicationScore", 0);
        map.put("clarityScore", 0);
        map.put("feedback", "No credit awarded (0%): " + checkResult.getDiagnosticReason());
        map.put("strengths", Collections.emptyList());
        map.put("areasToImprove", checkResult.getSuggestions());
        map.put("weaknesses", checkResult.getWeaknesses());
        map.put("suggestions", checkResult.getSuggestions());
        map.put("isZeroEvaluation", true);
        map.put("diagnosticReason", checkResult.getDiagnosticReason());
        return map;
    }

    public Map<String, Object> evaluateContent(String questionText, String studentAnswer, String expectedTopics) {
        EvaluationCheckResult checkResult = checkResponse(questionText, studentAnswer, expectedTopics);
        if (checkResult.isZeroScore()) {
            return buildZeroEvaluationMap(checkResult);
        }

        String rawAnswer = studentAnswer != null ? studentAnswer.trim() : "";
        String answerLower = rawAnswer.toLowerCase();
        String qLower = questionText != null ? questionText.toLowerCase() : "";

        // Check if student basically repeated the question words without adding real explanation
        String[] qWords = qLower.replaceAll("[^a-z0-9\\s]", " ").split("\\s+");
        Set<String> significantQWords = new HashSet<>();
        for (String w : qWords) {
            if (w.length() >= 4 && !STOP_WORDS.contains(w)) significantQWords.add(w);
        }

        String[] ansWords = answerLower.replaceAll("[^a-z0-9\\s]", " ").split("\\s+");
        int newWordsCount = 0;
        for (String w : ansWords) {
            if (w.length() >= 3 && !STOP_WORDS.contains(w) && !significantQWords.contains(w)) {
                newWordsCount++;
            }
        }

        if (newWordsCount < 3 && rawAnswer.length() < 50) {
            Map<String, Object> map = new LinkedHashMap<>();
            int lowScore = 15;
            map.put("accuracyScore", lowScore);
            map.put("overallScore", lowScore);
            map.put("technicalScore", lowScore);
            map.put("relevanceScore", 25);
            map.put("communicationScore", 20);
            map.put("clarityScore", 20);
            map.put("feedback", "Response merely restates the question prompt or provides superficial text without technical substance.");
            map.put("strengths", Collections.emptyList());
            map.put("areasToImprove", Arrays.asList(
                "Do not merely repeat question keywords; explain underlying mechanics",
                "Provide concrete technical definitions and architecture specifics"
            ));
            map.put("weaknesses", Collections.singletonList("Answer restates the question with minimal original technical explanation."));
            map.put("suggestions", Collections.singletonList("Detail step-by-step how the concept functions under the hood."));
            return map;
        }

        // Factual verification and penalty rules for standard interview concepts
        // Factual verification and penalty rules for standard interview concepts
        boolean hasContradiction = false;
        String contradictionDetail = null;

        // 0. Explicit self-declared incorrectness / nonsense / irrelevant input
        if (answerLower.contains("completely wrong") || answerLower.contains("irrelevant nonsense") || answerLower.contains("this is wrong") || answerLower.contains("random answer") || answerLower.contains("nonsense")) {
            hasContradiction = true;
            contradictionDetail = "Response explicitly contains invalid, contradictory, or self-declared incorrect statements.";
        }

        // 1. HashMap thread safety check
        if (!hasContradiction) {
            boolean claimsHashMapThreadSafe = (answerLower.contains("hashmap is thread safe")
                    || answerLower.contains("hashmap is synchronized")
                    || answerLower.contains("hashmap is thread-safe")
                    || answerLower.contains("hashmap is safe in multithreading")
                    || answerLower.contains("hashmap is threadsafe"))
                    && !answerLower.contains("not thread")
                    && !answerLower.contains("not synchronized")
                    && !answerLower.contains("isn't thread")
                    && !answerLower.contains("is not thread")
                    && !answerLower.contains("non-synchronized");

            boolean claimsConcurrentLocksEntire = answerLower.contains("concurrenthashmap locks the whole")
                    || answerLower.contains("concurrenthashmap locks the entire")
                    || answerLower.contains("locks the full map");

            boolean claimsHashMapAllowsManyNulls = answerLower.contains("hashmap allows multiple null keys");

            if (claimsHashMapThreadSafe) {
                hasContradiction = true;
                contradictionDetail = "Incorrect statement: HashMap is NOT thread-safe and is non-synchronized in Java. ConcurrentHashMap or Collections.synchronizedMap must be used for concurrency.";
            } else if (claimsConcurrentLocksEntire) {
                hasContradiction = true;
                contradictionDetail = "Incorrect statement: ConcurrentHashMap explicitly avoids locking the entire map by using bucket-level synchronization or CAS.";
            } else if (claimsHashMapAllowsManyNulls) {
                hasContradiction = true;
                contradictionDetail = "Incorrect statement: HashMap permits only a single null key.";
            }
        }

        // 2. Overloading vs Overriding check
        if (!hasContradiction) {
            boolean claimsOverloadingRuntime = (answerLower.contains("overloading is runtime")
                    || answerLower.contains("overloading happens at runtime")
                    || answerLower.contains("overloading is dynamic"))
                    && !answerLower.contains("not runtime")
                    && !answerLower.contains("overriding");

            boolean claimsOverridingCompileTime = (answerLower.contains("overriding is compile time")
                    || answerLower.contains("overriding happens at compile time")
                    || answerLower.contains("overriding is static"))
                    && !answerLower.contains("not compile");

            boolean claimsOverloadingInheritance = answerLower.contains("overloading requires inheritance")
                    || answerLower.contains("overloading needs super class");

            if (claimsOverloadingRuntime) {
                hasContradiction = true;
                contradictionDetail = "Incorrect statement: Method overloading is resolved at compile time (static binding / compile-time polymorphism), NOT at runtime.";
            } else if (claimsOverridingCompileTime) {
                hasContradiction = true;
                contradictionDetail = "Incorrect statement: Method overriding is dynamic polymorphism resolved at runtime based on the actual object type.";
            } else if (claimsOverloadingInheritance) {
                hasContradiction = true;
                contradictionDetail = "Incorrect statement: Overloading occurs within the same class and does not require inheritance.";
            }
        }

        // 3. Database Indexing writes penalty
        if (!hasContradiction) {
            boolean claimsIndexSpeedsInserts = (answerLower.contains("index speeds up insert")
                    || answerLower.contains("index accelerates write")
                    || answerLower.contains("indexes speed up write")
                    || answerLower.contains("indexes improve insert")
                    || answerLower.contains("index improves write"))
                    && !answerLower.contains("slow")
                    && !answerLower.contains("degrade");

            boolean claimsIndexSlowsSearch = (answerLower.contains("index slows down select")
                    || answerLower.contains("index decreases search speed"))
                    && !answerLower.contains("speeds up");

            if (claimsIndexSpeedsInserts) {
                hasContradiction = true;
                contradictionDetail = "Incorrect statement: Indexes add write overhead and typically slow down INSERT/UPDATE operations due to B-Tree maintenance.";
            } else if (claimsIndexSlowsSearch) {
                hasContradiction = true;
                contradictionDetail = "Incorrect statement: Indexes accelerate data retrieval and avoid costly full table scans.";
            }
        }

        // 4. SQL Joins
        if (!hasContradiction) {
            boolean claimsInnerAllLeft = answerLower.contains("inner join returns all rows from left")
                    || answerLower.contains("inner join returns everything from the left");
            if (claimsInnerAllLeft) {
                hasContradiction = true;
                contradictionDetail = "Incorrect statement: INNER JOIN only returns rows where join conditions match in both tables.";
            }
        }

        // 5. REST GET vs POST & Idempotency
        if (!hasContradiction) {
            boolean claimsGetNotIdempotent = (answerLower.contains("get is not idempotent")
                    || answerLower.contains("get is non-idempotent")
                    || answerLower.contains("get is unsafe"))
                    && !answerLower.contains("post is");

            boolean claimsPostIdempotent = (answerLower.contains("post is idempotent")
                    || answerLower.contains("post is safe"))
                    && !answerLower.contains("not idempotent");

            if (claimsGetNotIdempotent) {
                hasContradiction = true;
                contradictionDetail = "Incorrect statement: HTTP GET is idempotent and safe (repeated identical calls produce the same server state).";
            } else if (claimsPostIdempotent) {
                hasContradiction = true;
                contradictionDetail = "Incorrect statement: HTTP POST is not idempotent as successive requests produce additional resource creations.";
            }
        }

        // 6. Process vs Thread
        if (!hasContradiction) {
            boolean claimsProcessesShareMemory = (answerLower.contains("processes share memory")
                    || answerLower.contains("processes share address space")
                    || answerLower.contains("process shares memory"))
                    && !answerLower.contains("do not")
                    && !answerLower.contains("don't");

            boolean claimsThreadsNoSharedMemory = (answerLower.contains("threads do not share memory")
                    || answerLower.contains("threads have separate address spaces")
                    || answerLower.contains("threads don't share memory"))
                    && !answerLower.contains("processes have");

            if (claimsProcessesShareMemory) {
                hasContradiction = true;
                contradictionDetail = "Incorrect statement: Operating system processes run in isolated address spaces and do not share memory by default.";
            } else if (claimsThreadsNoSharedMemory) {
                hasContradiction = true;
                contradictionDetail = "Incorrect statement: Threads belonging to the same process share the process heap and memory space.";
            }
        }

        // If factually incorrect / contradictory: strict penalty to 0%-20% tier
        if (hasContradiction) {
            int wrongScore = 12;
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("accuracyScore", wrongScore);
            map.put("score", wrongScore);
            map.put("overallScore", wrongScore);
            map.put("technicalScore", wrongScore);
            map.put("relevanceScore", 20);
            map.put("communicationScore", 25);
            map.put("clarityScore", 20);
            map.put("feedback", "Factual inaccuracy detected: " + contradictionDetail + " Factual errors receive a penalized 0%-20% score.");
            map.put("strengths", Collections.emptyList());
            map.put("areasToImprove", Arrays.asList(
                contradictionDetail,
                "Review the core theoretical definitions and precise mechanisms of this topic",
                "Ensure technical claims are factually verified before presenting them in placement interviews"
            ));
            map.put("weaknesses", Collections.singletonList(contradictionDetail));
            map.put("suggestions", Collections.singletonList("Carefully study the exact distinctions, memory models, and trade-offs of this subject."));
            return map;
        }

        // Measure domain and topic concept completeness
        int relevanceMatches = countContentMatches(questionText, answerLower, expectedTopics);
        int techTermCount = 0;
        for (String term : COMMON_TECH_TERMS) {
            if (answerLower.contains(term)) techTermCount++;
        }

        boolean hasExplanatoryDepth = answerLower.contains("because")
                || answerLower.contains("since")
                || answerLower.contains("mechanism")
                || answerLower.contains("internally")
                || answerLower.contains("under the hood")
                || answerLower.contains("ensures")
                || answerLower.contains("prevents")
                || answerLower.contains("handles")
                || answerLower.contains("complexity")
                || answerLower.contains("structure")
                || answerLower.contains("trade-off")
                || answerLower.contains("allocat")
                || answerLower.contains("manag")
                || answerLower.contains("guarantee");

        int scoreTier;
        int techScore;
        int relScore;
        int commScore;
        int clarScore;
        String feedbackMsg;
        List<String> strengths = new ArrayList<>();
        List<String> areasToImprove = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        // Tier 3: Strong / Comprehensive Answer (80% - 100%)
        if (rawAnswer.length() >= 90 && relevanceMatches >= 4 && techTermCount >= 3 && hasExplanatoryDepth) {
            scoreTier = Math.min(95, 82 + (relevanceMatches * 2) + Math.min(8, rawAnswer.length() / 80));
            techScore = Math.min(98, scoreTier + 2);
            relScore = Math.min(96, scoreTier + 1);
            commScore = Math.min(94, scoreTier);
            clarScore = Math.min(95, scoreTier);
            feedbackMsg = "Strong technical explanation demonstrating solid conceptual accuracy, domain terminology, and clear structural reasoning.";
            strengths.add("Accurately identified and articulated core technical principles");
            strengths.add("Used precise computer science terminology without factual inaccuracies");
            strengths.add("Provided adequate depth explaining the underlying mechanism");
            areasToImprove.add("Mention edge cases, concurrent failure modes, or real-world production metrics to maximize interview impact");
            weaknesses.add("Could expand slightly on production-scale trade-offs");
            suggestions.add("Cite specific time/space complexity or system resource implications");
        }
        // Tier 2: Partially Correct / Incomplete Answer (40% - 60%)
        else if (rawAnswer.length() >= 35 && (relevanceMatches >= 2 || techTermCount >= 2)) {
            scoreTier = Math.min(60, 42 + (relevanceMatches * 4) + (techTermCount * 2));
            techScore = scoreTier;
            relScore = Math.min(65, scoreTier + 5);
            commScore = scoreTier;
            clarScore = Math.max(35, scoreTier - 5);
            feedbackMsg = "Partially correct response. Identified basic concepts but lacks technical depth, precise mechanisms, or implementation specifics.";
            strengths.add("Captured the general context of the interview question");
            areasToImprove.add("Deepen explanation by addressing how the mechanism functions step-by-step");
            areasToImprove.add("Introduce precise domain terminology rather than colloquial generalizations");
            weaknesses.add("Response is too brief or superficial to demonstrate full technical competency.");
            suggestions.add("Structure technical answers using: Definition -> Underlying Mechanism -> Practical Example.");
        }
        // Tier 1: Weak / Inadequate / Low-accuracy Answer (0% - 20%)
        else {
            scoreTier = Math.min(20, Math.max(8, 8 + (relevanceMatches * 2)));
            techScore = scoreTier;
            relScore = Math.min(25, scoreTier + 5);
            commScore = 20;
            clarScore = 15;
            feedbackMsg = "Inadequate response (low accuracy, <25%). Answer fails to explain the required technical concepts or provides insufficient substance.";
            areasToImprove.add("Study the foundational concepts of this topic in your placement syllabus");
            areasToImprove.add("Provide structured, substantive answers detailing key components and reasons");
            weaknesses.add("Very brief response with insufficient accuracy or technical depth (0%-20% tier).");
        }

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("accuracyScore", techScore);
        map.put("overallScore", scoreTier);
        map.put("technicalScore", techScore);
        map.put("relevanceScore", relScore);
        map.put("communicationScore", commScore);
        map.put("clarityScore", clarScore);
        map.put("feedback", feedbackMsg);
        map.put("strengths", strengths);
        map.put("areasToImprove", areasToImprove);
        map.put("weaknesses", weaknesses);
        map.put("suggestions", suggestions);
        return map;
    }

    private int countContentMatches(String questionText, String normalizedAnswer, String expectedTopics) {
        Set<String> keywords = new HashSet<>();

        // Extract key terms from questionText
        if (questionText != null) {
            String cleanQ = questionText.toLowerCase().replaceAll("[^a-z0-9\\s]", " ");
            for (String word : cleanQ.split("\\s+")) {
                word = word.trim();
                if (word.length() >= 3 && !STOP_WORDS.contains(word)) {
                    keywords.add(word);
                    // Add root/stem approximations
                    if (word.endsWith("ing") && word.length() > 5) keywords.add(word.substring(0, word.length() - 3));
                    if (word.endsWith("ed") && word.length() > 4) keywords.add(word.substring(0, word.length() - 2));
                    if (word.endsWith("s") && word.length() > 4) keywords.add(word.substring(0, word.length() - 1));
                }
            }
        }

        // Extract from expectedTopics
        if (expectedTopics != null) {
            String cleanT = expectedTopics.toLowerCase().replaceAll("[^a-z0-9\\s]", " ");
            for (String word : cleanT.split("\\s+")) {
                word = word.trim();
                if (word.length() >= 3 && !STOP_WORDS.contains(word)) {
                    keywords.add(word);
                }
            }
        }

        // Count how many question keywords or domain tech terms appear in the student's answer
        int matchCount = 0;
        String[] answerTokens = normalizedAnswer.split("\\s+");
        Set<String> answerWords = new HashSet<>(Arrays.asList(answerTokens));

        for (String kw : keywords) {
            if (answerWords.contains(kw) || normalizedAnswer.contains(kw)) {
                matchCount++;
            }
        }

        // Also check if any question-relevant common tech terms match
        for (String term : COMMON_TECH_TERMS) {
            if ((keywords.contains(term) || (questionText != null && questionText.toLowerCase().contains(term))) && answerWords.contains(term)) {
                matchCount += 2;
            }
        }

        return matchCount;
    }

    private boolean isGibberish(String normalized) {
        String[] words = normalized.split("\\s+");
        if (words.length == 0) return true;

        // Repeated word check: e.g. "bla bla bla" or "asdf asdf asdf"
        if (words.length >= 3) {
            Set<String> unique = new HashSet<>(Arrays.asList(words));
            if ((double) unique.size() / words.length < 0.3) {
                return true;
            }
        }

        for (String word : words) {
            if (word.length() >= 7) {
                // Check if word has zero vowels
                if (!Pattern.compile("[aeiou]").matcher(word).find()) {
                    return true;
                }
                // Check repeated single character e.g. "aaaaaaa", "zzzzzz"
                if (Pattern.compile("(.)\\1{4,}").matcher(word).find()) {
                    return true;
                }
            }
        }

        // Pattern mash check
        if (normalized.equals("asdfghjkl") || normalized.equals("qwertyuiop") || normalized.equals("zxcvbnm") || normalized.equals("12345678")) {
            return true;
        }

        return false;
    }

    private boolean isNumericAnswer(String s) {
        return s.matches("\\d+");
    }

    private String truncate(String text, int max) {
        if (text == null) return "";
        return text.length() > max ? text.substring(0, max) + "..." : text;
    }
}
