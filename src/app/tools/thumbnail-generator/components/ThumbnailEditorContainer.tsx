'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, PanelLeftClose, Settings, Construction } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from '@/hooks/use-media-query';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useTemplate, type ShapeType, type Layer } from '../contexts/TemplateContext';
import TemplateSelector from './TemplateSelector';
import ThumbnailText from './ThumbnailText';
import ThumbnailImage from './ThumbnailImage';
import ThumbnailShape from './ThumbnailShape';
import { LayerPanel } from './LayerPanel';
import ThumbnailPreview from './ThumbnailPreview';