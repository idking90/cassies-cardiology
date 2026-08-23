import hlhs from './hlhs.json'
import murmurs from './murmurs.json'
import vsds from './vsds.json'
import asd from './asd.json'
import freeSpaceGenetics from './free-space-genetics.json'
import heartFailure from './heart-failure.json'
import cchd from './cchd.json'
import alcapa from './alcapa.json'
import coarctation from './coarctation.json'
import echo from './echo.json'
import ekg from './ekg.json'
import infectiousDisease from './infectious-disease.json'
import cyanoticHeart from './cyanotic-heart.json'
import tapvr from './tapvr.json'
import htn from './htn.json'
import dorv from './dorv.json'
import sportsPhysical from './sports-physical.json'
import chestPain from './chest-pain.json'
import wpw from './wpw.json'
import pda from './pda.json'
import avcd from './avcd.json'
import transitional from './transitional.json'
import pulmonaryHypertension from './pulmonary-hypertension.json'
import cardiacMasses from './cardiac-masses.json'
import mechanicalCirculatorySupport from './mechanical-circulatory-support.json'
import type { Topic } from './types'
import { validateTopics } from './validate'

const rawTopics = [
  hlhs,
  murmurs,
  vsds,
  asd,
  freeSpaceGenetics,
  heartFailure,
  cchd,
  alcapa,
  coarctation,
  echo,
  ekg,
  infectiousDisease,
  cyanoticHeart,
  tapvr,
  htn,
  dorv,
  sportsPhysical,
  chestPain,
  wpw,
  pda,
  avcd,
  transitional,
  pulmonaryHypertension,
  cardiacMasses,
  mechanicalCirculatorySupport,
]

export const topics: Topic[] = validateTopics(rawTopics)

export function getTopic(topicId: string) {
  return topics.find((topic) => topic.id === topicId)
}

export function getTopics() {
  return topics
}
