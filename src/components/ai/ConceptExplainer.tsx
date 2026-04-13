import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Lightbulb, 
  BookOpen, 
  Zap, 
  Brain, 
  Target,
  CheckCircle,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface Concept {
  id: string;
  name: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  keyPoints: string[];
  examples: Array<{
    title: string;
    description: string;
    code?: string;
  }>;
  relatedConcepts: string[];
  prerequisites: string[];
  learningTime: string;
  masteryLevel: number;
}

const ConceptExplainer = () => {
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [showExamples, setShowExamples] = useState(true);
  const [showKeyPoints, setShowKeyPoints] = useState(true);

  const concepts: Concept[] = [
    {
      id: '1',
      name: 'Recursion',
      category: 'Programming',
      difficulty: 'intermediate',
      description: 'A programming technique where a function calls itself to solve smaller instances of the same problem.',
      keyPoints: [
        'Base case: Condition to stop recursion',
        'Recursive case: Function calls itself with modified parameters',
        'Stack memory: Each call creates a new stack frame',
        'Efficiency: Can be memory-intensive for deep recursion'
      ],
      examples: [
        {
          title: 'Factorial Calculation',
          description: 'Calculate factorial using recursion',
          code: `function factorial(n) {
  if (n <= 1) return 1;  // Base case
  return n * factorial(n - 1);  // Recursive case
}`
        },
        {
          title: 'Fibonacci Sequence',
          description: 'Generate Fibonacci numbers recursively',
          code: `function fibonacci(n) {
  if (n <= 1) return n;  // Base case
  return fibonacci(n - 1) + fibonacci(n - 2);  // Recursive case
}`
        }
      ],
      relatedConcepts: ['Stack Memory', 'Base Case', 'Tail Recursion', 'Dynamic Programming'],
      prerequisites: ['Functions', 'Parameters', 'Return Values'],
      learningTime: '45 minutes',
      masteryLevel: 0
    },
    {
      id: '2',
      name: 'Binary Search Tree',
      category: 'Data Structures',
      difficulty: 'intermediate',
      description: 'A tree data structure where each node has at most two children, with left child smaller and right child larger.',
      keyPoints: [
        'Ordered structure: Left < Parent < Right',
        'Search efficiency: O(log n) average case',
        'Insertion: Maintains BST property',
        'Traversal: In-order gives sorted result'
      ],
      examples: [
        {
          title: 'BST Insertion',
          description: 'Insert a value while maintaining BST property',
          code: `function insert(root, value) {
  if (!root) return new Node(value);
  
  if (value < root.value) {
    root.left = insert(root.left, value);
  } else {
    root.right = insert(root.right, value);
  }
  return root;
}`
        }
      ],
      relatedConcepts: ['Trees', 'Binary Trees', 'Search Algorithms', 'Balanced Trees'],
      prerequisites: ['Trees', 'Comparison Operators', 'Recursion'],
      learningTime: '60 minutes',
      masteryLevel: 0
    },
    {
      id: '3',
      name: 'Object-Oriented Programming',
      category: 'Programming Paradigms',
      difficulty: 'beginner',
      description: 'A programming paradigm based on objects that contain data and code together.',
      keyPoints: [
        'Encapsulation: Bundle data and methods',
        'Inheritance: Reuse code through hierarchy',
        'Polymorphism: Different forms of same method',
        'Abstraction: Hide implementation details'
      ],
      examples: [
        {
          title: 'Class Definition',
          description: 'Define a class with properties and methods',
          code: `class Car {
  constructor(make, model) {
    this.make = make;
    this.model = model;
  }
  
  start() {
    console.log('Car started!');
  }
}`
        }
      ],
      relatedConcepts: ['Classes', 'Objects', 'Inheritance', 'Polymorphism'],
      prerequisites: ['Variables', 'Functions', 'Basic Programming'],
      learningTime: '90 minutes',
      masteryLevel: 0
    },
    {
      id: '4',
      name: 'Time Complexity',
      category: 'Algorithms',
      difficulty: 'intermediate',
      description: 'Analysis of how algorithm runtime grows with input size.',
      keyPoints: [
        'Big O notation: Describes upper bound',
        'Common complexities: O(1), O(n), O(log n), O(n²)',
        'Best vs Worst vs Average case',
        'Space complexity: Memory usage analysis'
      ],
      examples: [
        {
          title: 'Linear Search O(n)',
          description: 'Search through array element by element',
          code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`
        }
      ],
      relatedConcepts: ['Algorithms', 'Big O Notation', 'Space Complexity', 'Optimization'],
      prerequisites: ['Loops', 'Arrays', 'Basic Math'],
      learningTime: '75 minutes',
      masteryLevel: 0
    }
  ];

  const filteredConcepts = concepts.filter(concept =>
    concept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    concept.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    concept.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty: Concept['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectConcept = (concept: Concept) => {
    setSelectedConcept(concept);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    if (selectedConcept && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  const renderExplanationStep = () => {
    if (!selectedConcept) return null;

    const steps = [
      {
        title: 'Overview',
        icon: <Lightbulb className="w-5 h-5" />,
        content: (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">{selectedConcept.name}</h3>
              <p className="text-muted-foreground">{selectedConcept.description}</p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Badge className={getDifficultyColor(selectedConcept.difficulty)}>
                {selectedConcept.difficulty}
              </Badge>
              <Badge variant="secondary">{selectedConcept.category}</Badge>
              <Badge variant="outline">
                <Brain className="w-3 h-3 mr-1" />
                {selectedConcept.learningTime}
              </Badge>
            </div>

            {selectedConcept.prerequisites.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Prerequisites:</h4>
                <div className="flex gap-2 flex-wrap">
                  {selectedConcept.prerequisites.map(prereq => (
                    <Badge key={prereq} variant="outline" className="text-xs">
                      {prereq}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      },
      {
        title: 'Key Points',
        icon: <Target className="w-5 h-5" />,
        content: (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Important Concepts</h3>
            <div className="space-y-2">
              {selectedConcept.keyPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{point}</span>
                </div>
              ))}
            </div>
          </div>
        )
      },
      {
        title: 'Examples',
        icon: <BookOpen className="w-5 h-5" />,
        content: (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Practical Examples</h3>
            {selectedConcept.examples.map((example, index) => (
              <Card key={index} className="bg-muted/30">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{example.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{example.description}</p>
                  {example.code && (
                    <div className="bg-black text-green-400 p-3 rounded-md font-mono text-sm overflow-x-auto">
                      <pre>{example.code}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      },
      {
        title: 'Related Topics',
        icon: <Zap className="w-5 h-5" />,
        content: (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Continue Learning</h3>
            <div>
              <h4 className="font-medium mb-2">Related Concepts:</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedConcept.relatedConcepts.map(concept => (
                  <Badge key={concept} variant="outline" className="justify-center">
                    {concept}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-medium mb-2">🎯 Next Steps:</h4>
              <ul className="text-sm space-y-1">
                <li>• Practice problems related to {selectedConcept.name}</li>
                <li>• Explore real-world applications</li>
                <li>• Try implementing from scratch</li>
                <li>• Teach the concept to someone else</li>
              </ul>
            </div>
          </div>
        )
      }
    ];

    const currentStepData = steps[currentStep];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStepData.icon}
            <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleReset}>
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  index <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="min-h-[300px]">
          {currentStepData.content}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleNextStep}
            disabled={currentStep === steps.length - 1}
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-[600px] flex flex-col shadow-lg">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="w-5 h-5 text-primary" />
          Concept Explainer
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-4">
        {!selectedConcept ? (
          <div className="h-full flex flex-col">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {filteredConcepts.map((concept) => (
                  <Card
                    key={concept.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleSelectConcept(concept)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm leading-tight">
                            {concept.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {concept.description}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getDifficultyColor(concept.difficulty)}>
                              {concept.difficulty}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {concept.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Brain className="w-3 h-3 mr-1" />
                              {concept.learningTime}
                            </Badge>
                          </div>
                        </div>
                        
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <ScrollArea className="h-full">
            {renderExplanationStep()}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ConceptExplainer;
