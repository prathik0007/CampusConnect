package com.prathik.campusconnect.data.repository

import android.content.ContentValues
import android.content.Context
import android.provider.CalendarContract
import com.prathik.campusconnect.model.Event
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class CalendarRepository {

    fun isEventInCalendar(context: Context, eventId: String, eventTitle: String): Boolean {
        return try {
            val projection = arrayOf(
                CalendarContract.Events._ID,
                CalendarContract.Events.TITLE,
                CalendarContract.Events.DESCRIPTION
            )
            val selection = "${CalendarContract.Events.DESCRIPTION} LIKE ? OR ${CalendarContract.Events.TITLE} = ?"
            val selectionArgs = arrayOf("%[CampusConnect Event ID: $eventId]%", eventTitle)

            val cursor = context.contentResolver.query(
                CalendarContract.Events.CONTENT_URI,
                projection,
                selection,
                selectionArgs,
                null
            )

            val exists = (cursor != null && cursor.count > 0)
            cursor?.close()
            exists
        } catch (e: SecurityException) {
            false
        } catch (e: Exception) {
            false
        }
    }

    fun addEventToCalendar(context: Context, event: Event): Result<Long> {
        return try {
            val calendarId = findWritableCalendarId(context)
                ?: return Result.failure(Exception("No writable calendar is available on this device."))

            if (isEventInCalendar(context, event.id, event.title)) {
                return Result.failure(Exception("Event is already in your calendar."))
            }

            val startMillis = parseDateTimeToMillis(event.startDate, isStart = true)
            val endMillis = parseDateTimeToMillis(event.endDate, isStart = false, defaultStartMillis = startMillis)

            val values = ContentValues().apply {
                put(CalendarContract.Events.CALENDAR_ID, calendarId)
                put(CalendarContract.Events.TITLE, event.title)
                put(
                    CalendarContract.Events.DESCRIPTION,
                    "${event.description}\n\nOrganized by CampusConnect\n[CampusConnect Event ID: ${event.id}]"
                )
                put(CalendarContract.Events.EVENT_LOCATION, event.location)
                put(CalendarContract.Events.DTSTART, startMillis)
                put(CalendarContract.Events.DTEND, endMillis)
                put(CalendarContract.Events.EVENT_TIMEZONE, TimeZone.getDefault().id)
            }

            val uri = context.contentResolver.insert(CalendarContract.Events.CONTENT_URI, values)
            if (uri != null) {
                val insertedId = uri.lastPathSegment?.toLongOrNull() ?: 1L
                Result.success(insertedId)
            } else {
                Result.failure(Exception("Failed to insert event into calendar."))
            }
        } catch (e: SecurityException) {
            Result.failure(Exception("Calendar permission is required to add this event."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "An error occurred while accessing the calendar."))
        }
    }

    private fun findWritableCalendarId(context: Context): Long? {
        val projection = arrayOf(
            CalendarContract.Calendars._ID,
            CalendarContract.Calendars.IS_PRIMARY,
            CalendarContract.Calendars.CALENDAR_ACCESS_LEVEL
        )

        val cursor = context.contentResolver.query(
            CalendarContract.Calendars.CONTENT_URI,
            projection,
            null,
            null,
            null
        ) ?: return null

        var primaryCalendarId: Long? = null
        var fallbackCalendarId: Long? = null

        cursor.use { c ->
            val idCol = c.getColumnIndex(CalendarContract.Calendars._ID)
            val primaryCol = c.getColumnIndex(CalendarContract.Calendars.IS_PRIMARY)
            val accessCol = c.getColumnIndex(CalendarContract.Calendars.CALENDAR_ACCESS_LEVEL)

            while (c.moveToNext()) {
                val id = c.getLong(idCol)
                val isPrimary = if (primaryCol >= 0) c.getInt(primaryCol) == 1 else false
                val accessLevel = if (accessCol >= 0) c.getInt(accessCol) else 0

                val isWritable = accessLevel >= CalendarContract.Calendars.CAL_ACCESS_CONTRIBUTOR
                if (isWritable) {
                    if (isPrimary) {
                        primaryCalendarId = id
                        break
                    } else if (fallbackCalendarId == null) {
                        fallbackCalendarId = id
                    }
                }
            }
        }

        return primaryCalendarId ?: fallbackCalendarId
    }

    fun parseDateTimeToMillis(dateStr: String, isStart: Boolean, defaultStartMillis: Long? = null): Long {
        if (dateStr.isBlank() || dateStr.equals("TBD", ignoreCase = true)) {
            val cal = Calendar.getInstance()
            if (!isStart && defaultStartMillis != null) {
                return defaultStartMillis + 2 * 3600 * 1000 // 2 hours duration
            }
            return cal.timeInMillis + 24 * 3600 * 1000
        }

        val dateFormats = listOf(
            SimpleDateFormat("MMM dd, yyyy - hh:mm a", Locale.US),
            SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US),
            SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US),
            SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.US),
            SimpleDateFormat("yyyy-MM-dd", Locale.US),
            SimpleDateFormat("MMM dd, yyyy", Locale.US)
        )

        for (format in dateFormats) {
            try {
                format.timeZone = TimeZone.getDefault()
                val date = format.parse(dateStr.trim())
                if (date != null) {
                    return date.time
                }
            } catch (e: Exception) {
                // Continue trying next pattern
            }
        }

        // Fallback calculation
        val cal = Calendar.getInstance()
        if (!isStart && defaultStartMillis != null) {
            return defaultStartMillis + 2 * 3600 * 1000
        }
        return cal.timeInMillis + 24 * 3600 * 1000
    }
}
