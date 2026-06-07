"use client";

import React from "react";
import { Topic } from "../../index";

interface TopicCardProps {
  topic: Topic;
  selected: boolean;
  onToggle: (id: string) => void;
}

export default function TopicCard({ topic, selected, onToggle }: TopicCardProps) {
  const classNames = [
    "topic-card",
    selected ? "topic-card--selected" : "",
    topic.size === "large" ? "topic-card--large" : "",
    topic.size === "wide" ? "topic-card--wide" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classNames}
      onClick={() => onToggle(topic.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onToggle(topic.id)}
      aria-pressed={selected}
    >
      <div className="topic-card__check" aria-hidden="true">
        <span className="topic-card__check-icon">✓</span>
      </div>

      {topic.size === "wide" ? (
        <>
          <div className="topic-card__icon-wrap">
            <span>{topic.icon}</span>
          </div>
          <div className="topic-card__text">
            {topic.category && <p className="topic-card__category">{topic.category}</p>}
            <p className="topic-card__label">{topic.label}</p>
            {topic.sublabel && <p className="topic-card__sublabel">{topic.sublabel}</p>}
          </div>
        </>
      ) : (
        <>
          <div className="topic-card__icon-wrap">
            <span>{topic.icon}</span>
          </div>
          <div>
            {topic.category && <p className="topic-card__category">{topic.category}</p>}
            <p className="topic-card__label">{topic.label}</p>
            {topic.sublabel && <p className="topic-card__sublabel">{topic.sublabel}</p>}
          </div>
        </>
      )}
    </div>
  );
}