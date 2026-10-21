package com.aiinterview.coach.repository;

import com.aiinterview.coach.entity.XpTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface XpTransactionRepository extends JpaRepository<XpTransaction, Long> {
    List<XpTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
}
