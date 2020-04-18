module DesignSystem.Breakpoint exposing (whenWide)

import Css exposing (..)
import Css.Media as M


smallScreenBreakpoint =
    px 800


whenWide rules =
    M.withMedia [ M.only M.screen [ M.minWidth smallScreenBreakpoint ] ] rules
