"use client"

import { AppSidebar } from "@/core/layout/app-sidebar"
import { buildNav } from "@/core/nav/build-nav"

import { features } from "./_features"

const nav = buildNav(features)

export function DashboardSidebar() {
  return <AppSidebar nav={nav} />
}
