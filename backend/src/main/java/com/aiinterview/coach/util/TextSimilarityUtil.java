package com.aiinterview.coach.util;

import java.util.*;
import java.util.stream.Collectors;

public class TextSimilarityUtil {

    private static final double SIMILARITY_THRESHOLD = 0.65;

    public static String normalizeText(String input) {
        if (input == null) return "";
        return input.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    public static Set<String> getTokens(String text) {
        String normalized = normalizeText(text);
        if (normalized.isEmpty()) return Collections.emptySet();
        return Arrays.stream(normalized.split("\\s+"))
                .filter(token -> token.length() > 2)
                .collect(Collectors.toSet());
    }

    public static double calculateJaccardSimilarity(String text1, String text2) {
        Set<String> set1 = getTokens(text1);
        Set<String> set2 = getTokens(text2);

        if (set1.isEmpty() || set2.isEmpty()) return 0.0;

        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);

        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);

        return (double) intersection.size() / (double) union.size();
    }

    public static boolean isTooSimilar(String question1, String question2) {
        return calculateJaccardSimilarity(question1, question2) >= SIMILARITY_THRESHOLD;
    }
}
