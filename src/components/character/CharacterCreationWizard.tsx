"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  GraduationCap,
  Map,
  Sparkles,
  Sword,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const academicRoutes = [
  {
    id: "software-engineering",
    name: "Software Engineering",
    focus: "Lifecycle mastery and resilient systems",
    core: ["System Architecture", "Testing Pipelines", "Programming"],
    description:
      "Forge production-grade solutions, govern releases, and steward complex feature work from ideation to launch.",
  },
  {
    id: "computer-science",
    name: "Computer Science",
    focus: "Theoretical foundations and elegant problem solving",
    core: ["Algorithms", "Data Structures", "Computational Theory"],
    description:
      "Decode the arcane laws of computation, optimize every spell, and bend logic to your whims.",
  },
  {
    id: "data-science",
    name: "Data Science",
    focus: "Intelligence extraction and predictive insight",
    core: ["Statistics", "Machine Learning", "Data Engineering"],
    description:
      "Distill patterns from chaos, craft foresight engines, and transform datasets into tactical advantages.",
  },
];

const careerClasses = [
  {
    id: "backend",
    name: "Backend Developer",
    summary: "Server rituals and data conduits",
    description:
      "Design APIs, steward databases, and orchestrate distributed services that never falter.",
    keySkills: ["Node.js", "PostgreSQL", "System Design"],
  },
  {
    id: "frontend",
    name: "Frontend Developer",
    summary: "Interfaces and enchanted user journeys",
    description:
      "Craft immersive experiences, weave accessibility into every pixel, and animate layouts with intent.",
    keySkills: ["React", "Design Systems", "Animations"],
  },
  {
    id: "fullstack",
    name: "Full-Stack Developer",
    summary: "Dual-wield both realms",
    description:
      "Balance client delight with server strength and command entire features from schema to screen.",
    keySkills: ["TypeScript", "Next.js", "Cloud Deployment"],
  },
];

type Specialization = {
  id: string;
  name: string;
  roadmap: string[];
  modules: string[];
  integration: string[];
  description: string;
};

const specializations: Record<string, Specialization[]> = {
  backend: [
    {
      id: "dotnet",
      name: ".NET Development",
      description:
        "Harness Microsoft&apos;s ecosystem to deliver enterprise-grade services and automation tools.",
      roadmap: ["ASP.NET Core", "Azure Services", "C# Patterns"],
      modules: [
        "C# Language Mastery",
        "Entity Framework & SQL",
        "Azure Functions & DevOps",
      ],
      integration: [
        "API Gateway hardening",
        "Observability with OpenTelemetry",
        "CI/CD with GitHub Actions",
      ],
    },
    {
      id: "java-backend",
      name: "Java Microservices",
      description:
        "Engineer resilient services with the Spring stack, JVM tooling, and cloud-native rituals.",
      roadmap: ["Spring Boot", "Microservice Architecture", "Kafka Streams"],
      modules: [
        "Spring Framework Core",
        "Hibernate & JPA",
        "Service Mesh Design",
      ],
      integration: [
        "Containerization with Docker",
        "Cloud deployment playbooks",
        "Contract testing suites",
      ],
    },
  ],
  frontend: [
    {
      id: "experiential-ui",
      name: "Experiential UI",
      description:
        "Blend motion, accessibility, and realtime data to conjure unforgettable journeys.",
      roadmap: ["Advanced React", "GSAP Immersion", "Web Animations"],
      modules: [
        "Design Token Systems",
        "State Machines & UX Patterns",
        "Realtime Collaboration Interfaces",
      ],
      integration: [
        "Design to dev pipelines",
        "Performance budget enforcement",
        "Storybook driven documentation",
      ],
    },
    {
      id: "frontend-architecture",
      name: "Frontend Architecture",
      description:
        "Scale complex apps with modular patterns, testing arsenals, and resilient rendering.",
      roadmap: ["Next.js", "TypeScript", "Testing Library"],
      modules: [
        "Advanced Routing Strategies",
        "Edge Rendering & Caching",
        "Visual Regression Automation",
      ],
      integration: [
        "Component governance",
        "Accessibility audits",
        "Perf observability dashboards",
      ],
    },
  ],
  fullstack: [
    {
      id: "modern-fullstack",
      name: "Modern Full-Stack",
      description:
        "Command the entire stack with TypeScript, Next.js, and cloud-native delivery rituals.",
      roadmap: ["Next.js", "TRPC", "Supabase"],
      modules: [
        "Full-stack TypeScript",
        "Data modeling & supabase",
        "Deploy & scale on Vercel",
      ],
      integration: [
        "Secure auth flows",
        "Observability & health checks",
        "Performance-first delivery",
      ],
    },
    {
      id: "devsecops",
      name: "DevSecOps Vanguard",
      description:
        "Fuse development with secure delivery, automating release conduits and guardrails.",
      roadmap: ["Docker", "Kubernetes", "Security Automation"],
      modules: [
        "Infrastructure as Code",
        "Security pipelines",
        "Service hardening drills",
      ],
      integration: [
        "Secrets management rituals",
        "Incident response playbooks",
        "Continuous verification",
      ],
    },
  ],
};

const routeTimelines: Record<
  string,
  {
    foundation: string[];
    specialization: string[];
  }
> = {
  "software-engineering": {
    foundation: [
      "Programming Fundamentals (C / Java)",
      "Data Structures & Algorithms",
      "Database Management",
      "Software Engineering Principles",
    ],
    specialization: [
      "System Architecture Labs",
      "Testing Automation Suites",
      "CI/CD Strategy",
      "Production Incident Triage",
    ],
  },
  "computer-science": {
    foundation: [
      "Discrete Mathematics",
      "Algorithm Analysis",
      "Compiler Construction",
      "Operating Systems",
    ],
    specialization: [
      "Advanced Algorithms",
      "Distributed Systems",
      "Computational Complexity",
      "Research Practicum",
    ],
  },
  "data-science": {
    foundation: [
      "Statistics Essentials",
      "Data Wrangling with Python",
      "Probability & Inference",
      "SQL for Analytics",
    ],
    specialization: [
      "Machine Learning Pipelines",
      "MLOps & Deployment",
      "Deep Learning Systems",
      "Data Storytelling",
    ],
  },
};

const baseAchievements = [
  "Character Created",
  "Learning Path Established",
  "Initial Arsenal Ready",
];

interface CharacterCreationWizardProps {
  compact?: boolean;
}

export function CharacterCreationWizard({
  compact = false,
}: CharacterCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);

  const currentProgress = useMemo(
    () => ((currentStep + 1) / 4) * 100,
    [currentStep],
  );

  const availableSpecializations = useMemo(() => {
    if (!selectedClass) {
      return [] as Specialization[];
    }
    return specializations[selectedClass] ?? [];
  }, [selectedClass]);

  const activeSpecialization = useMemo(() => {
    if (!selectedSpec) {
      return null;
    }
    return (
      availableSpecializations.find((spec) => spec.id === selectedSpec) ?? null
    );
  }, [availableSpecializations, selectedSpec]);

  const activeRoute = useMemo(
    () =>
      selectedRoute
        ? (academicRoutes.find((route) => route.id === selectedRoute) ?? null)
        : null,
    [selectedRoute],
  );

  const activeClass = useMemo(
    () =>
      selectedClass
        ? (careerClasses.find((career) => career.id === selectedClass) ?? null)
        : null,
    [selectedClass],
  );

  const timeline = useMemo(() => {
    if (!selectedRoute) {
      return null;
    }
    return routeTimelines[selectedRoute] ?? null;
  }, [selectedRoute]);

  const canProceed = useMemo(() => {
    if (currentStep === 0) {
      return Boolean(selectedRoute);
    }
    if (currentStep === 1) {
      return Boolean(selectedClass);
    }
    if (currentStep === 2) {
      return Boolean(selectedSpec);
    }
    return true;
  }, [currentStep, selectedClass, selectedRoute, selectedSpec]);

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (!canProceed) {
      return;
    }
    setCurrentStep((prev) => Math.min(3, prev + 1));
  };

  const resetToStep = (step: number) => {
    setCurrentStep(step);
  };

  const stepTitle = [
    "Choose your Academic Route",
    "Choose your Career Class",
    "Select your Specialization",
    "Preview & Lock In",
  ][currentStep];

  const renderRouteStep = () => (
    <div className={cn("grid gap-4 lg:grid-cols-2", compact && "gap-3.5")}>
      {academicRoutes.map((route) => {
        const isActive = selectedRoute === route.id;
        const summary = route.description.includes(".")
          ? `${route.description.split(".")[0]!.trim()}.`
          : route.description;
        return (
          <Card
            key={route.id}
            onClick={() => {
              setSelectedRoute(route.id);
              setSelectedClass(null);
              setSelectedSpec(null);
            }}
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-3xl border border-white/12 bg-linear-to-br from-[#2f1811]/88 via-[#1c0c11]/93 to-[#0a0407]/97 p-4 shadow-[0_16px_48px_rgba(24,6,12,0.45)] transition-transform duration-200 hover:-translate-y-1",
              compact && "p-3.5",
              isActive
                ? "border-accent/60 shadow-[0_24px_60px_rgba(210,49,135,0.4)]"
                : "hover:shadow-[0_24px_60px_rgba(210,49,135,0.28)]",
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.32),transparent_70%)] opacity-55" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(240,177,90,0.24),transparent_72%)]" />
            <CardContent
              className={cn(
                "relative z-10 space-y-3 p-0",
                compact && "space-y-2.5",
              )}
            >
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-foreground/60">
                <span>Route Codex</span>
                {isActive && (
                  <span className="flex items-center gap-1 text-accent">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Selected
                  </span>
                )}
              </div>
              <h2
                className={cn(
                  "text-xl font-semibold text-white",
                  compact && "text-[19px]",
                )}
              >
                {route.name}
              </h2>
              <p
                className={cn(
                  "text-[13px] leading-relaxed text-foreground/70",
                  compact && "text-[12px]",
                )}
              >
                {summary}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.35em] text-foreground/50">
                {route.core.slice(0, 2).map((coreSkill) => (
                  <span
                    key={coreSkill}
                    className="rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-accent"
                  >
                    {coreSkill}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoute(route.id);
                  setSelectedClass(null);
                  setSelectedSpec(null);
                }}
                className="flex items-center gap-1 text-[11px] uppercase tracking-[0.4em] text-accent"
              >
                Select
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderClassStep = () => (
    <div className={cn("grid gap-4 lg:grid-cols-3", compact && "gap-3.5")}>
      {careerClasses.map((career) => {
        const isActive = selectedClass === career.id;
        const trimmed = career.description.split(".")[0]?.trim();
        const summary =
          trimmed && trimmed.length > 0 ? `${trimmed}.` : career.description;
        return (
          <Card
            key={career.id}
            onClick={() => setSelectedClass(career.id)}
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-[22px] border border-white/12 bg-linear-to-br from-[#31170f]/88 via-[#1c0c10]/93 to-[#090407]/97 p-4 shadow-[0_16px_48px_rgba(24,6,12,0.45)] transition-transform duration-200 hover:-translate-y-1",
              compact && "p-3.5",
              isActive
                ? "border-accent/60 shadow-[0_24px_60px_rgba(210,49,135,0.38)]"
                : "hover:shadow-[0_24px_60px_rgba(210,49,135,0.28)]",
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.3),transparent_70%)] opacity-55" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(240,177,90,0.22),transparent_72%)]" />
            <CardContent
              className={cn(
                "relative z-10 space-y-3 p-0",
                compact && "space-y-2.5",
              )}
            >
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-foreground/60">
                <span>Guild Discipline</span>
                {isActive && (
                  <CheckCircle className="h-4 w-4 text-emerald-300" />
                )}
              </div>
              <h3
                className={cn(
                  "text-lg font-semibold text-white",
                  compact && "text-[17px]",
                )}
              >
                {career.name}
              </h3>
              <p
                className={cn(
                  "text-[12px] text-foreground/60 uppercase tracking-[0.3em]",
                  compact && "text-[11px]",
                )}
              >
                {career.summary}
              </p>
              <p
                className={cn(
                  "text-[13px] leading-relaxed text-foreground/70",
                  compact && "text-[12px]",
                )}
              >
                {summary}
              </p>
              <ul className="space-y-1 text-[12px] text-foreground/65">
                {career.keySkills.slice(0, 2).map((skill) => (
                  <li key={skill} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {skill}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderSpecializationStep = () => (
    <div className={cn("grid gap-4 lg:grid-cols-2", compact && "gap-3.5")}>
      {availableSpecializations.map((spec) => {
        const isActive = selectedSpec === spec.id;
        const trimmed = spec.description.split(".")[0]?.trim();
        const summary =
          trimmed && trimmed.length > 0 ? `${trimmed}.` : spec.description;
        return (
          <Card
            key={spec.id}
            onClick={() => setSelectedSpec(spec.id)}
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-[22px] border border-white/12 bg-linear-to-br from-[#31170f]/88 via-[#1b0b10]/94 to-[#090307]/97 p-4 shadow-[0_16px_48px_rgba(24,6,12,0.45)] transition-transform duration-200 hover:-translate-y-1",
              compact && "p-3.5",
              isActive
                ? "border-accent/60 shadow-[0_24px_60px_rgba(210,49,135,0.36)]"
                : "hover:shadow-[0_24px_60px_rgba(210,49,135,0.26)]",
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.28),transparent_70%)] opacity-55" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(240,177,90,0.22),transparent_72%)]" />
            <CardContent
              className={cn(
                "relative z-10 space-y-3 p-0",
                compact && "space-y-2.5",
              )}
            >
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-foreground/60">
                <span>Specialization Track</span>
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <h3
                className={cn(
                  "text-lg font-semibold text-white",
                  compact && "text-[17px]",
                )}
              >
                {spec.name}
              </h3>
              <p
                className={cn(
                  "text-[13px] leading-relaxed text-foreground/70",
                  compact && "text-[12px]",
                )}
              >
                {summary}
              </p>
              <div className="space-y-2.5 text-[12px] text-foreground/65">
                <div className="flex items-start gap-2">
                  <Map className="mt-0.5 h-3.5 w-3.5 text-amber-300" />
                  <span>{spec.roadmap[0] ?? "Milestone revealed soon"}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Trophy className="mt-0.5 h-3.5 w-3.5 text-accent" />
                  <span>{spec.modules[0] ?? "Core module incoming"}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Sword className="mt-0.5 h-3.5 w-3.5 text-rose-200" />
                  <span>
                    {spec.integration[0] ?? "Integration ritual pending"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSpec(spec.id)}
                className="flex items-center gap-1 text-[11px] uppercase tracking-[0.4em] text-accent"
              >
                Select
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderSummaryStep = () => {
    const foundationItems = timeline?.foundation ?? [
      "Awaiting route selection",
    ];
    const specializationItems = timeline?.specialization ?? [
      "Awaiting route selection",
    ];
    const modulesList = activeSpecialization?.modules ?? [
      "Programming Fundamentals",
      "Version Control with Git",
      "Web Foundations",
    ];
    const integrationList = activeSpecialization?.integration ?? [
      "Secure login rituals",
      "Study schedule linked",
      "Mentor request drafted",
    ];
    const displayedFoundation = compact ? foundationItems : foundationItems;
    const displayedSpecialization = compact
      ? specializationItems
      : specializationItems;
    const displayedModules = compact ? modulesList : modulesList;
    const displayedIntegration = compact ? integrationList : integrationList;
    const displayedAchievements = compact ? baseAchievements : baseAchievements;

    return (
      <div
        className={cn(
          "grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]",
          compact && "gap-4 items-start",
        )}
      >
        <Card
          className={cn(
            "relative rounded-[30px] border border-white/12 bg-linear-to-br from-[#351910]/88 via-[#1f0d11]/94 to-[#0b0508]/97 p-5 shadow-[0_24px_70px_rgba(26,8,12,0.55)]",
            compact && "p-4 max-h-[47vh] overflow-hidden",
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.32),transparent_70%)] opacity-60" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(240,177,90,0.24),transparent_72%)]" />
          <CardContent
            className={cn(
              "relative z-10 space-y-5 p-0",
              compact && "space-y-3.5 max-h-[calc(47vh-2rem)] overflow-y-auto pr-2",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-foreground/60",
                compact && "text-[10px]",
              )}
            >
              <span>Avatar Ledger</span>
              <CheckCircle className="h-4 w-4 text-emerald-300" />
            </div>
            <div
              className={cn(
                "rounded-3xl border border-white/12 bg-black/30 p-5",
                compact && "p-4",
              )}
            >
              <p
                className={cn(
                  "text-xs uppercase tracking-[0.3em] text-foreground/50",
                  compact && "text-[11px]",
                )}
              >
                Guild Identity
              </p>
              <h2
                className={cn(
                  "mt-3 text-[26px] font-semibold text-white",
                  compact && "text-[22px]",
                )}
              >
                Your Character is Ready
              </h2>
              <div
                className={cn(
                  "mt-5 grid gap-3 text-sm text-foreground/70 sm:grid-cols-2",
                  compact && "mt-3.5 gap-2 text-[13px]",
                )}
              >
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-foreground/50">
                    Academic Route
                  </p>
                  <p className="text-sm text-white">
                    {activeRoute?.name ?? "Pending"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-foreground/50">
                    Career Class
                  </p>
                  <p className="text-sm text-white">
                    {activeClass?.name ?? "Pending"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-foreground/50">
                    Specialization
                  </p>
                  <p className="text-sm text-white">
                    {activeSpecialization?.name ?? "Pending"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-foreground/50">
                    Roadmap
                  </p>
                  <p className="text-sm text-white">
                    {activeSpecialization?.roadmap.join(" → ") ??
                      "Choose a track to unveil milestones"}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "rounded-3xl border border-white/12 bg-white/5 p-5",
                compact && "p-3.5",
              )}
            >
              <p
                className={cn(
                  "text-xs uppercase tracking-[0.35em] text-foreground/50",
                  compact && "text-[11px]",
                )}
              >
                Curriculum Timeline
              </p>
              <div
                className={cn(
                  "mt-4 grid gap-5 lg:grid-cols-2",
                  compact && "mt-3 gap-3",
                )}
              >
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-amber-300">
                    <Sparkles className="h-4 w-4" />
                    Semesters 1-4
                  </p>
                  <ul
                    className={cn(
                      "space-y-2 text-sm text-foreground/70",
                      compact && "space-y-1.5 text-[13px]",
                    )}
                  >
                    {displayedFoundation.map((item) => (
                      <li
                        key={item}
                        className={cn(
                          "rounded-xl border border-white/10 bg-white/5 px-4 py-2",
                          compact && "px-3 py-2",
                        )}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-accent">
                    <Sparkles className="h-4 w-4" />
                    Semesters 5-8
                  </p>
                  <ul
                    className={cn(
                      "space-y-2 text-sm text-foreground/70",
                      compact && "space-y-1.5 text-[13px]",
                    )}
                  >
                    {displayedSpecialization.map((item) => (
                      <li
                        key={item}
                        className={cn(
                          "rounded-xl border border-white/10 bg-white/5 px-4 py-2",
                          compact && "px-3 py-2",
                        )}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "grid gap-4 text-sm text-foreground/70 lg:grid-cols-2",
                compact && "gap-3 text-[13px]",
              )}
            >
              <div
                className={cn(
                  "rounded-3xl border border-white/12 bg-black/30 p-5",
                  compact && "p-4",
                )}
              >
                <p className="text-[11px] uppercase tracking-[0.35em] text-foreground/50">
                  Starting Modules
                </p>
                <ul
                  className={cn(
                    "mt-3 space-y-2",
                    compact && "mt-2.5 space-y-1.5",
                  )}
                >
                  {displayedModules.map((item) => (
                    <li
                      key={item}
                      className={cn(
                        "rounded-xl border border-white/10 bg-white/5 px-4 py-2",
                        compact && "px-3 py-2",
                      )}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className={cn(
                  "rounded-3xl border border-white/12 bg-black/30 p-5",
                  compact && "p-4",
                )}
              >
                <p className="text-[11px] uppercase tracking-[0.35em] text-foreground/50">
                  Initial Achievements
                </p>
                <ul
                  className={cn(
                    "mt-3 space-y-2",
                    compact && "mt-2.5 space-y-1.5",
                  )}
                >
                  {displayedAchievements.map((achievement) => (
                    <li
                      key={achievement}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2",
                        compact && "gap-2 px-3 py-2",
                      )}
                    >
                      <CheckCircle
                        className={cn(
                          "h-4 w-4 text-emerald-300",
                          compact && "h-3.5 w-3.5",
                        )}
                      />
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-4",
                compact && "gap-3",
              )}
            >
              <div className="text-[11px] uppercase tracking-[0.35em] text-foreground/60">
                Adjust this path later in settings
              </div>
              <div className={cn("flex flex-wrap gap-3", compact && "gap-2.5")}>
                <Button
                  variant="outline"
                  className={cn(
                    "rounded-full border-white/20 bg-white/5 px-6 text-[11px] uppercase tracking-[0.35em] text-foreground hover:bg-white/10",
                    compact && "px-[1.05rem]",
                  )}
                  onClick={() => resetToStep(0)}
                >
                  Customize
                </Button>
                <Button
                  className={cn(
                    "rounded-full bg-accent px-6 text-[11px] uppercase tracking-[0.35em] text-accent-foreground hover:bg-accent/90",
                    compact && "px-5",
                  )}
                >
                  Begin Journey
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className={cn("grid gap-5", compact && "gap-3 self-start")}>
          <Card
            className={cn(
              "relative overflow-hidden rounded-[26px] border border-white/12 bg-linear-to-br from-[#2d1510]/88 via-[#190a10]/94 to-[#090407]/97 p-5 shadow-[0_20px_60px_rgba(24,6,12,0.5)]",
              compact && "p-3",
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.28),transparent_70%)] opacity-60" />
            <CardContent
              className={cn(
                "relative z-10 space-y-4 p-0 text-sm text-foreground/70",
                compact && "space-y-1.5 text-[13px]",
              )}
            >
              <p className="text-[11px] uppercase tracking-[0.35em] text-foreground/50">
                Avatar Preview
              </p>
              <div
                className={cn(
                  "rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center text-white",
                  compact && "px-3 py-2",
                )}
              >
                Alex Chen
                <div className="mt-1 text-[11px] uppercase tracking-[0.35em] text-foreground/50">
                  Level 1 Initiate
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "relative overflow-hidden rounded-[26px] border border-white/12 bg-linear-to-br from-[#2d1510]/88 via-[#190a10]/94 to-[#090407]/97 p-5 shadow-[0_20px_60px_rgba(24,6,12,0.5)]",
              compact && "p-3",
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(240,177,90,0.2),transparent_70%)] opacity-60" />
            <CardContent
              className={cn(
                "relative z-10 space-y-4 p-0 text-sm text-foreground/70",
                compact && "space-y-2.5 text-[13px]",
              )}
            >
              <p className="text-[11px] uppercase tracking-[0.35em] text-foreground/50">
                Integration Checklist
              </p>
              <ul className={cn("space-y-3", compact && "space-y-2")}>
                {displayedIntegration.map((item) => (
                  <li
                    key={item}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3",
                      compact && "gap-2 px-3 py-2.5",
                    )}
                  >
                    <Sparkles
                      className={cn(
                        "h-4 w-4 text-accent",
                        compact && "h-3.5 w-3.5",
                      )}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    if (currentStep === 0) {
      return renderRouteStep();
    }
    if (currentStep === 1) {
      return renderClassStep();
    }
    if (currentStep === 2) {
      return renderSpecializationStep();
    }
    return renderSummaryStep();
  };

  return (
    <div className={cn("flex flex-col gap-7", compact && "gap-5")}>
      <div
        className={cn(
          "relative overflow-hidden rounded-[30px] border border-white/12 bg-linear-to-br from-[#351910]/88 via-[#1e0d11]/94 to-[#0b0508]/97 p-8 shadow-[0_26px_76px_rgba(28,8,12,0.58)]",
          compact && "p-6",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.35),transparent_70%)] opacity-55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(240,177,90,0.22),transparent_72%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-[0.15]" />
        <div className={cn("relative z-10 space-y-5", compact && "space-y-4")}>
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-4",
              compact && "gap-3",
            )}
          >
            <div className="text-[11px] uppercase tracking-[0.4em] text-foreground/60">
              RogueLearn Character Creation
            </div>
            <div className="text-[11px] uppercase tracking-[0.4em] text-foreground/60">
              Step {currentStep + 1} / 4
            </div>
          </div>
          <h1
            className={cn(
              "text-3xl font-semibold text-white",
              compact && "text-2xl",
            )}
          >
            {stepTitle}
          </h1>
          <p
            className={cn(
              "max-w-3xl text-[15px] leading-relaxed text-foreground/70",
              compact && "text-[13px]",
            )}
          >
            Shape your adventurer&apos;s destiny. Each decision tailors the
            curriculum, mentors, and artefacts the guild will deploy on your
            behalf.
          </p>
          <div className={cn("space-y-2.5", compact && "space-y-2")}>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-foreground/60">
              <span>Progress {Math.round(currentProgress)}%</span>
              <span>
                {currentProgress === 100 ? "Ready for launch" : "Continuing"}
              </span>
            </div>
            <Progress value={currentProgress} className="h-2 bg-white/10" />
          </div>
        </div>
      </div>

      {renderStep()}

      <div
        className={cn(
          "flex items-center justify-between rounded-[26px] border border-white/12 bg-white/5 px-6 py-4 text-[11px] uppercase tracking-[0.35em] text-foreground/60",
          compact && "px-5 py-3.5",
        )}
      >
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
          className={cn(
            "flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-foreground hover:bg-white/10 disabled:opacity-40",
            compact && "px-3.5",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <span>
          {currentStep < 3
            ? "Selections lock per step — adjust before advancing"
            : "All selections locked. Begin when ready."}
        </span>
        <Button
          onClick={handleNext}
          disabled={!canProceed || currentStep === 3}
          className={cn(
            "flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-accent-foreground hover:bg-accent/90 disabled:opacity-50",
            compact && "px-4",
          )}
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
