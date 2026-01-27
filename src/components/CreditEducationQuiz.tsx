import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const QUIZZES: Quiz[] = [
  {
    id: 'fcra-basics',
    title: 'FCRA Fundamentals',
    description: 'Test your knowledge of the Fair Credit Reporting Act',
    difficulty: 'beginner',
    questions: [
      {
        id: 'q1',
        question: 'How many days do credit bureaus have to investigate a dispute?',
        options: ['15 days', '30 days', '45 days', '60 days'],
        correctIndex: 1,
        explanation: 'Under the FCRA, credit bureaus must complete their investigation within 30 days of receiving your dispute.',
      },
      {
        id: 'q2',
        question: 'How long do most negative items stay on your credit report?',
        options: ['3 years', '5 years', '7 years', '10 years'],
        correctIndex: 2,
        explanation: 'Most negative items, including late payments and collections, remain on your credit report for 7 years from the date of first delinquency.',
      },
      {
        id: 'q3',
        question: 'Which is NOT one of the three major credit bureaus?',
        options: ['Experian', 'Equifax', 'TransUnion', 'FICO'],
        correctIndex: 3,
        explanation: 'FICO is a credit scoring company, not a credit bureau. The three major bureaus are Experian, Equifax, and TransUnion.',
      },
      {
        id: 'q4',
        question: 'How often can you get a free credit report from each bureau?',
        options: ['Once per month', 'Once per year', 'Once every 2 years', 'Anytime'],
        correctIndex: 1,
        explanation: 'Under federal law, you are entitled to one free credit report from each bureau every 12 months through AnnualCreditReport.com.',
      },
      {
        id: 'q5',
        question: 'What percentage of your FICO score is determined by payment history?',
        options: ['15%', '25%', '30%', '35%'],
        correctIndex: 3,
        explanation: 'Payment history is the most important factor, making up 35% of your FICO score.',
      },
    ],
  },
  {
    id: 'dispute-strategies',
    title: 'Dispute Strategies',
    description: 'Learn effective dispute techniques',
    difficulty: 'intermediate',
    questions: [
      {
        id: 'q1',
        question: 'What should you include in every dispute letter?',
        options: ['Your SSN only', 'Account number and reason for dispute', 'Just your name', 'Your credit score'],
        correctIndex: 1,
        explanation: 'Always include the account number, specific reason for the dispute, and supporting documentation.',
      },
      {
        id: 'q2',
        question: 'What is a "goodwill letter"?',
        options: ['A legal demand', 'A request to remove accurate negative info as a courtesy', 'A credit freeze request', 'A fraud alert'],
        correctIndex: 1,
        explanation: 'A goodwill letter politely asks a creditor to remove accurate negative information as a gesture of goodwill.',
      },
      {
        id: 'q3',
        question: 'When should you escalate to the CFPB?',
        options: ['Immediately with any dispute', 'After 15 days', 'When bureaus fail to respond within legal timeframes', 'Never'],
        correctIndex: 2,
        explanation: 'Escalate to the CFPB when credit bureaus or furnishers fail to respond within the legally required 30-day window.',
      },
      {
        id: 'q4',
        question: 'What is "debt validation"?',
        options: ['Confirming you owe the debt', 'Requesting proof the collector has the right to collect', 'Paying a debt', 'Ignoring a debt'],
        correctIndex: 1,
        explanation: 'Debt validation is your right to request proof that a collector has the legal right to collect the debt and that the amount is accurate.',
      },
      {
        id: 'q5',
        question: 'Which dispute method is most effective?',
        options: ['Online disputes only', 'Certified mail with documentation', 'Phone calls', 'Social media complaints'],
        correctIndex: 1,
        explanation: 'Certified mail creates a paper trail and legally documents when your dispute was received, which is crucial for FCRA timelines.',
      },
    ],
  },
  {
    id: 'credit-building',
    title: 'Credit Building Mastery',
    description: 'Advanced strategies for rebuilding credit',
    difficulty: 'advanced',
    questions: [
      {
        id: 'q1',
        question: 'What is the ideal credit utilization ratio?',
        options: ['0%', 'Under 30%', '50%', 'Over 75%'],
        correctIndex: 1,
        explanation: 'Keeping your credit utilization under 30% is recommended. Under 10% is even better for optimal scores.',
      },
      {
        id: 'q2',
        question: 'What is the "authorized user" strategy?',
        options: ['Opening a joint account', 'Being added to someone else\'s credit card', 'Sharing your login', 'Co-signing a loan'],
        correctIndex: 1,
        explanation: 'Becoming an authorized user on a responsible person\'s credit card can help build your credit history.',
      },
      {
        id: 'q3',
        question: 'Which account type has the longest positive impact?',
        options: ['Payday loans', 'Installment loans with on-time payments', 'Collections accounts', 'Closed accounts'],
        correctIndex: 1,
        explanation: 'Installment loans (like auto loans or mortgages) with consistent on-time payments demonstrate long-term creditworthiness.',
      },
      {
        id: 'q4',
        question: 'How many hard inquiries significantly impact your score?',
        options: ['1-2', '3-4', '5-6', '10+'],
        correctIndex: 2,
        explanation: 'Having 5-6+ hard inquiries can significantly lower your score. They remain on your report for 2 years but impact decreases over time.',
      },
      {
        id: 'q5',
        question: 'What is a "rapid rescore"?',
        options: ['Quick online dispute', 'Expedited score update during mortgage process', 'Automatic score refresh', 'Credit monitoring alert'],
        correctIndex: 1,
        explanation: 'A rapid rescore is a process used by mortgage lenders to quickly update your credit score after you\'ve made positive changes.',
      },
    ],
  },
];

interface CreditEducationQuizProps {
  userId: string;
}

export const CreditEducationQuiz = ({ userId }: CreditEducationQuizProps) => {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; correct: boolean }[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const { toast } = useToast();

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setQuizComplete(false);
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null || !selectedQuiz) return;
    
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setAnswers(prev => [...prev, { questionId: currentQuestion.id, correct: isCorrect }]);
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (!selectedQuiz) return;
    
    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
      const finalScore = score + (selectedAnswer === selectedQuiz.questions[currentQuestionIndex].correctIndex ? 1 : 0);
      const percentage = Math.round((finalScore / selectedQuiz.questions.length) * 100);
      
      // Save progress to localStorage
      const savedProgress = JSON.parse(localStorage.getItem(`quiz_progress_${userId}`) || '{}');
      savedProgress[selectedQuiz.id] = {
        score: finalScore,
        total: selectedQuiz.questions.length,
        percentage,
        completedAt: new Date().toISOString(),
      };
      localStorage.setItem(`quiz_progress_${userId}`, JSON.stringify(savedProgress));
      
      if (percentage === 100) {
        toast({
          title: '🏆 Perfect Score!',
          description: 'You\'ve mastered this topic!',
        });
      }
    }
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setQuizComplete(false);
  };

  // Get saved progress
  const getSavedProgress = (quizId: string) => {
    const saved = localStorage.getItem(`quiz_progress_${userId}`);
    if (saved) {
      const data = JSON.parse(saved);
      return data[quizId];
    }
    return null;
  };

  if (quizComplete && selectedQuiz) {
    const percentage = Math.round((score / selectedQuiz.questions.length) * 100);
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
            percentage >= 80 ? 'bg-green-100 dark:bg-green-900/30' : 
            percentage >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 
            'bg-red-100 dark:bg-red-900/30'
          }`}>
            <Trophy className={`w-10 h-10 ${
              percentage >= 80 ? 'text-green-600' : 
              percentage >= 60 ? 'text-yellow-600' : 
              'text-red-600'
            }`} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-4xl font-bold text-primary mb-2">{percentage}%</p>
          <p className="text-muted-foreground mb-6">
            You answered {score} out of {selectedQuiz.questions.length} questions correctly
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={resetQuiz}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Another Quiz
            </Button>
            <Button onClick={() => startQuiz(selectedQuiz)}>
              Retake Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedQuiz) {
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100;

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">{selectedQuiz.title}</Badge>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctIndex;
              const showCorrectness = showResult;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    showCorrectness
                      ? isCorrect
                        ? 'bg-green-50 border-green-500 dark:bg-green-900/30'
                        : isSelected
                        ? 'bg-red-50 border-red-500 dark:bg-red-900/30'
                        : 'bg-muted/50'
                      : isSelected
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showCorrectness && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    {showCorrectness && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className={`p-4 rounded-lg ${
              selectedAnswer === currentQuestion.correctIndex
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-yellow-50 dark:bg-yellow-900/20'
            }`}>
              <p className="text-sm">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="flex justify-end">
            {!showResult ? (
              <Button onClick={submitAnswer} disabled={selectedAnswer === null}>
                Submit Answer
              </Button>
            ) : (
              <Button onClick={nextQuestion}>
                {currentQuestionIndex < selectedQuiz.questions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  'See Results'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Credit Education Quizzes</h2>
        <p className="text-muted-foreground">Test your knowledge and earn XP</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {QUIZZES.map((quiz) => {
          const progress = getSavedProgress(quiz.id);
          return (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <GraduationCap className="w-8 h-8 text-primary" />
                  <Badge variant={
                    quiz.difficulty === 'beginner' ? 'secondary' :
                    quiz.difficulty === 'intermediate' ? 'default' :
                    'destructive'
                  }>
                    {quiz.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{quiz.title}</CardTitle>
                <CardDescription>{quiz.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    {quiz.questions.length} questions
                  </span>
                  {progress && (
                    <Badge variant="outline" className="gap-1">
                      <Trophy className="w-3 h-3" />
                      {progress.percentage}%
                    </Badge>
                  )}
                </div>
                <Button className="w-full" onClick={() => startQuiz(quiz)}>
                  {progress ? 'Retake Quiz' : 'Start Quiz'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
