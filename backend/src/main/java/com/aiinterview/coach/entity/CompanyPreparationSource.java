package com.aiinterview.coach.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "company_preparation_sources")
public class CompanyPreparationSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "source_title", nullable = false)
    private String sourceTitle;

    @Column(name = "source_url")
    private String sourceUrl;

    @Column(name = "description_notes", columnDefinition = "TEXT")
    private String descriptionNotes;

    public CompanyPreparationSource() {}

    public CompanyPreparationSource(Company company, String sourceTitle, String sourceUrl, String descriptionNotes) {
        this.company = company;
        this.sourceTitle = sourceTitle;
        this.sourceUrl = sourceUrl;
        this.descriptionNotes = descriptionNotes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    public String getSourceTitle() { return sourceTitle; }
    public void setSourceTitle(String sourceTitle) { this.sourceTitle = sourceTitle; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getDescriptionNotes() { return descriptionNotes; }
    public void setDescriptionNotes(String descriptionNotes) { this.descriptionNotes = descriptionNotes; }
}
