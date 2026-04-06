using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DITT.Host.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPackageIdToTool : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PackageId",
                table: "Tools",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PackageId",
                table: "Tools");
        }
    }
}
